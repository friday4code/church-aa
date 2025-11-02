// utils/excelParser.ts
import * as XLSX from 'xlsx';

export interface ParseOptions {
    sheetName?: string;
    headers?: string[];
}

export const parseExcelFile = (file: File, options: ParseOptions = {}): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = options.sheetName || workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: options.headers || ['stateName', 'regionName', 'leader'],
                    range: 1 // Skip header row if headers are provided
                });

                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};