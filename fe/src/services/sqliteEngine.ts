import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import type {
  QueryResult,
  ExplainPlanRow,
  ValidationResult,
} from '@/types/tutorial.types';

let sqlEngineInstance: SqlJsStatic | null = null;
let initPromise: Promise<SqlJsStatic> | null = null;

export async function getSqlEngine(): Promise<SqlJsStatic> {
  if (sqlEngineInstance) {
    return sqlEngineInstance;
  }
  if (!initPromise) {
    const baseUrl = import.meta.env.BASE_URL?.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL || ''}/`;

    initPromise = initSqlJs({
      locateFile: (file) => `${baseUrl}${file}`,
    })
      .then((engine) => {
        sqlEngineInstance = engine;
        return engine;
      })
      .catch((err) => {
        initPromise = null;
        sqlEngineInstance = null;
        console.error('Failed to initialize SQLite WebAssembly engine:', err);
        throw err;
      });
  }
  return initPromise;
}

export async function createSessionDb(
  schemaSql: string,
  seedSql: string
): Promise<Database> {
  const engine = await getSqlEngine();
  const db = new engine.Database();
  
  if (schemaSql) {
    db.run(schemaSql);
  }
  if (seedSql) {
    db.run(seedSql);
  }
  return db;
}

export function executeQuery(db: Database, sql: string): QueryResult {
  const start = performance.now();
  const trimmed = sql.trim();
  if (!trimmed) {
    return {
      columns: [],
      values: [],
      executionTimeMs: 0,
      rowCount: 0,
    };
  }

  const res = db.exec(trimmed);
  const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;

  if (res.length === 0) {
    return {
      columns: [],
      values: [],
      executionTimeMs,
      rowCount: 0,
    };
  }

  const lastResult = res[res.length - 1];
  return {
    columns: lastResult.columns,
    values: lastResult.values,
    executionTimeMs,
    rowCount: lastResult.values.length,
  };
}

export function explainQueryPlan(db: Database, sql: string): ExplainPlanRow[] {
  const cleanSql = sql.trim().replace(/;+$/, '');
  if (!cleanSql) return [];

  try {
    const res = db.exec(`EXPLAIN QUERY PLAN ${cleanSql}`);
    if (res.length === 0) return [];
    const result = res[0];
    return result.values.map((row) => ({
      id: Number(row[0]),
      parent: Number(row[1]),
      notused: Number(row[2]),
      detail: String(row[3]),
    }));
  } catch {
    return [];
  }
}

export function validateExercise(
  db: Database,
  userSql: string,
  expectedSql: string,
  requiredKeywords: string[] = [],
  forbiddenKeywords: string[] = []
): ValidationResult {
  const trimmedUser = userSql.trim();

  if (!trimmedUser) {
    return {
      passed: false,
      messageVi: 'Vui lòng nhập câu lệnh SQL trước khi nộp bài.',
      messageEn: 'Please enter a SQL query before submitting evidence.',
      actualCount: 0,
      expectedCount: 0,
    };
  }

  // Check required keywords
  const missingKeywords: string[] = [];
  for (const kw of requiredKeywords) {
    const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (!regex.test(trimmedUser)) {
      missingKeywords.push(kw);
    }
  }

  if (missingKeywords.length > 0) {
    return {
      passed: false,
      messageVi: `Bạn cần dùng từ khóa: ${missingKeywords.join(', ')}`,
      messageEn: `Required syntax keyword(s) missing: ${missingKeywords.join(', ')}`,
      actualCount: 0,
      expectedCount: 0,
      missingKeywords,
    };
  }

  // Check forbidden keywords
  for (const kw of forbiddenKeywords) {
    const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(trimmedUser)) {
      return {
        passed: false,
        messageVi: `Không được dùng cú pháp: ${kw}`,
        messageEn: `Forbidden syntax detected: ${kw}`,
        actualCount: 0,
        expectedCount: 0,
      };
    }
  }

  // Create isolated database clones to prevent state contamination or DDL collision
  const snapshot = db.export();
  const engine = sqlEngineInstance;
  const userDb = engine ? new engine.Database(snapshot) : db;
  const expDb = engine ? new engine.Database(snapshot) : db;

  const cleanup = () => {
    if (engine) {
      try {
        userDb.close();
        expDb.close();
      } catch {
        // ignore
      }
    }
  };

  // Execute user query first on clean userDb
  let userRes;
  try {
    userRes = userDb.exec(trimmedUser);
  } catch (err: unknown) {
    cleanup();
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      messageVi: `Lỗi cú pháp SQL: ${msg}`,
      messageEn: `SQL syntax error: ${msg}`,
      actualCount: 0,
      expectedCount: 0,
    };
  }

  // Execute expected query on clean expDb
  let expectedRes;
  try {
    expectedRes = expDb.exec(expectedSql);
  } catch (err: unknown) {
    cleanup();
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      messageVi: `Lỗi hệ thống kiểm tra đáp án: ${msg}`,
      messageEn: `Internal check error: ${msg}`,
      actualCount: 0,
      expectedCount: 0,
    };
  }

  // For DDL or statements with no rows (like CREATE INDEX)
  if (!expectedRes || expectedRes.length === 0) {
    cleanup();
    return {
      passed: true,
      messageVi: 'Chính xác! Câu lệnh đã chạy đúng yêu cầu.',
      messageEn: 'Correct! Command executed successfully and satisfied requirements.',
      actualCount: 0,
      expectedCount: 0,
    };
  }

  if (!userRes || userRes.length === 0) {
    cleanup();
    return {
      passed: false,
      messageVi: 'Truy vấn không có dữ liệu trả về.',
      messageEn: 'Query returned no tabular result set.',
      actualCount: 0,
      expectedCount: expectedRes[0].values.length,
    };
  }

  const expTable = expectedRes[expectedRes.length - 1];
  const actTable = userRes[userRes.length - 1];

  cleanup();

  // Compare column count
  if (actTable.columns.length !== expTable.columns.length) {
    return {
      passed: false,
      messageVi: `Số cột chưa đúng: Bạn đang lấy ${actTable.columns.length} cột, nhưng đề bài yêu cầu ${expTable.columns.length} cột (${expTable.columns.join(', ')}).`,
      messageEn: `Column count mismatch: Got ${actTable.columns.length} column(s), expected ${expTable.columns.length} (${expTable.columns.join(', ')}).`,
      actualCount: actTable.values.length,
      expectedCount: expTable.values.length,
    };
  }

  // Compare row count
  if (actTable.values.length !== expTable.values.length) {
    return {
      passed: false,
      messageVi: `Số dòng chưa đúng: Bạn ra ${actTable.values.length} dòng, nhưng đáp án cần ${expTable.values.length} dòng.`,
      messageEn: `Row count mismatch: Got ${actTable.values.length} row(s), expected ${expTable.values.length} row(s).`,
      actualCount: actTable.values.length,
      expectedCount: expTable.values.length,
    };
  }

  // Compare values
  const normalize = (v: unknown): string =>
    v === null || v === undefined ? 'NULL' : String(v).trim().toLowerCase();

  for (let r = 0; r < expTable.values.length; r++) {
    const expRow = expTable.values[r];
    const actRow = actTable.values[r];
    for (let c = 0; c < expRow.length; c++) {
      if (normalize(expRow[c]) !== normalize(actRow[c])) {
        return {
          passed: false,
          messageVi: `Chưa đúng ở dòng ${r + 1}, cột "${actTable.columns[c]}": Kết quả của bạn là "${actRow[c]}", đáp án là "${expRow[c]}".`,
          messageEn: `Data mismatch at row ${r + 1}, column "${actTable.columns[c]}": Got "${actRow[c]}", expected "${expRow[c]}".`,
          actualCount: actTable.values.length,
          expectedCount: expTable.values.length,
        };
      }
    }
  }

  return {
    passed: true,
    messageVi: 'Chính xác! Kết quả hoàn toàn khớp với đáp án.',
    messageEn: 'Accurate! Forensic evidence strictly matches investigation requirements.',
    actualCount: actTable.values.length,
    expectedCount: expTable.values.length,
  };
}
