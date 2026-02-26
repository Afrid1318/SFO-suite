const xlsx = require("xlsx");
const path = require("path");

const EXCEL_PATH = path.join(__dirname, "../data/users.xlsx");

function getUsersFromExcel() {
  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const users = xlsx.utils.sheet_to_json(sheet);

  // Normalize data
  return users.map(u => ({
    username: String(u.username || "").trim(),
    email: String(u.email || "").trim().toLowerCase(),
    password: String(u.password || ""),
    role: String(u.role || "user").toLowerCase()
  }));
}

module.exports = { getUsersFromExcel };
