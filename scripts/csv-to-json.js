/**
 * CSV → JSON 변환 스크립트
 * 약국 CSV 파일을 읽어서 public/data/pharmacies.json으로 변환
 * 약국명에서 괄호 안의 약사 이름 제거
 */

const fs = require("fs");
const path = require("path");

const CSV_PATH = path.resolve(
  process.env.HOME,
  "Library/Application Support/Claude/local-agent-mode-sessions/ef3fc9d5-0c2f-4b90-987f-280cd4ff7ef4/ee5d5a7a-eccd-40a8-8ddb-ab37441a32ec/local_095b6d47-636d-42f0-8150-562cf2cb01ec/outputs/어린이튼튼라인_주문약국_통합.csv"
);

const OUTPUT_PATH = path.resolve(__dirname, "../public/data/pharmacies.json");

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function removePharmacistName(name) {
  // Remove parenthesized pharmacist name from pharmacy name
  // e.g., "맑은온누리약국(최원석)" → "맑은온누리약국"
  return name.replace(/\([^)]*\)$/, "").trim();
}

const csv = fs.readFileSync(CSV_PATH, "utf-8");
const lines = csv.split("\n").filter((line) => line.trim());

// Skip header
const pharmacies = [];
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  if (fields.length < 3) continue;

  const [rawName, phone, address] = fields;
  const name = removePharmacistName(rawName);

  pharmacies.push({
    name,
    phone,
    address,
  });
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(pharmacies, null, 2), "utf-8");
console.log(`Converted ${pharmacies.length} pharmacies to JSON`);
console.log(`Output: ${OUTPUT_PATH}`);
