import * as XLSX from "xlsx";
import { promises as fs } from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface TestMethod {
  value: string;
  label: string;
  code: String;
}

interface TestData {
  id: string;
  code: string;
  test_parameter: string;
  test_methods: TestMethod[];
  sample_class: string;
  status: string;
}

async function getFile() {
  try {
    // Correct path and read file as binary
    const data = await fs.readFile(
      path.join(process.cwd(), "src/components/services/data/services.xlsx")
    );

    // Read the workbook with binary data
    const workbook = XLSX.read(data, { type: "buffer" });

    const sheetNames = workbook.SheetNames;

    const transformRow = (row: any, sampleClass: string): TestData => {
      const testMethods: TestMethod[] = [];
      if (row["BS"] && row["BS"] !== "-") {
        testMethods.push({ value: "bs", label: "BS", code: row["BS"] });
      }
      if (row["ASTM"] && row["ASTM"] !== "-") {
        testMethods.push({ value: "astm", label: "ASTM", code: row["ASTM"] });
      }

      return {
        id: uuidv4(),
        code: row["Code"],
        test_parameter: row["Test Parameter"],
        test_methods: testMethods,
        sample_class: sampleClass.toLowerCase().replaceAll(" ", ""),
        status: "active",
      };
    };

    const transformedData: TestData[] = [];

    sheetNames.forEach((sheetName) => {
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      sheet.forEach((row: any) => {
        if (row["Code"] && row["Test Parameter"]) {
          transformedData.push(transformRow(row, sheetName));
        }
      });
    });

    const outputFilePath = path.join(
      process.cwd(),
      "src/components/services/data/services.json"
    );

    await fs.writeFile(
      outputFilePath,
      JSON.stringify(transformedData, null, 2),
      "utf8"
    );

    console.log(`JSON file has been created at ${outputFilePath}`);
  } catch (error) {
    console.error("Error processing the file:", error);
  }
}

async function main() {
  await getFile();
}

main().catch(console.error);
