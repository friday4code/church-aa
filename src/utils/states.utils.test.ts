// utils/states.utils.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyStatesToClipboard, exportStatesToExcel, exportStatesToCSV, exportStatesToPDF } from './states.utils';
import type { State } from '@/types/states.type';

// Mock external dependencies
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(() => ({ sheets: [] })),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    autoTable: vi.fn(),
    internal: {
      getNumberOfPages: vi.fn(() => 1),
    },
    pageSize: {
      width: 210,
      height: 297,
    },
    save: vi.fn(),
  })),
}));

vi.mock('jspdf-autotable', () => ({}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock DOM methods
Object.assign(global, {
  document: {
    createElement: vi.fn(() => ({
      value: '',
      style: { visibility: 'hidden' },
      select: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  execCommand: vi.fn(),
  Blob: vi.fn(),
  URL: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
});

describe('States Utils', () => {
  const mockStates: State[] = [
    {
      id: 1,
      name: 'California',
      code: 'CA',
      leader: 'John Smith',
      region: 'West',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      id: 2,
      name: 'New York',
      code: 'NY',
      leader: 'Jane Doe',
      region: 'East',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-04'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('copyStatesToClipboard', () => {
    it('should copy states to clipboard successfully', async () => {
      await copyStatesToClipboard(mockStates);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'S/N\tState Name\tState Code\tState Leader\tRegion\tCreated Date\n' +
        '1\tCalifornia\tCA\tJohn Smith\tWest\t1/1/2023\n' +
        '2\tNew York\tNY\tJane Doe\tEast\t1/3/2023'
      );
    });

    it('should handle clipboard API failure with fallback', async () => {
      const mockError = new Error('Clipboard API failed');
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(mockError);

      await copyStatesToClipboard(mockStates);

      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should handle empty states array', async () => {
      await copyStatesToClipboard([]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('S/N\tState Name\tState Code\tState Leader\tRegion\tCreated Date\n');
    });
  });

  describe('exportStatesToExcel', () => {
    it('should export states to Excel successfully', () => {
      const { utils, writeFile } = require('xlsx');
      
      exportStatesToExcel(mockStates);

      expect(utils.json_to_sheet).toHaveBeenCalledWith([
        {
          'S/N': 1,
          'State Name': 'California',
          'State Code': 'CA',
          'State Leader': 'John Smith',
          'Region': 'West',
          'Created Date': '1/1/2023',
          'Updated Date': '1/2/2023',
        },
        {
          'S/N': 2,
          'State Name': 'New York',
          'State Code': 'NY',
          'State Leader': 'Jane Doe',
          'Region': 'East',
          'Created Date': '1/3/2023',
          'Updated Date': '1/4/2023',
        },
      ]);

      expect(utils.book_new).toHaveBeenCalled();
      expect(utils.book_append_sheet).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringMatching(/^states-data-\d{4}-\d{2}-\d{2}\.xlsx$/)
      );
    });

    it('should handle empty states array', () => {
      const { utils, writeFile } = require('xlsx');
      
      exportStatesToExcel([]);

      expect(utils.json_to_sheet).toHaveBeenCalledWith([]);
      expect(writeFile).toHaveBeenCalled();
    });

    it('should handle export errors gracefully', () => {
      const { utils } = require('xlsx');
      utils.json_to_sheet.mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      exportStatesToExcel(mockStates);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to Excel:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export states to Excel. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('exportStatesToCSV', () => {
    it('should export states to CSV successfully', () => {
      const linkMock = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: { visibility: 'hidden' },
      };

      global.document.createElement = vi.fn(() => linkMock as any);

      exportStatesToCSV(mockStates);

      expect(linkMock.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(linkMock.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/^states-data-\d{4}-\d{2}-\d{2}\.csv$/)
      );
      expect(linkMock.click).toHaveBeenCalled();
    });

    it('should handle states with special characters in CSV', () => {
      const statesWithSpecialChars: State[] = [
        {
          id: 1,
          name: 'California "The Golden"',
          code: 'CA',
          leader: 'John "The Leader" Smith',
          region: 'West',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      const linkMock = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: { visibility: 'hidden' },
      };

      global.document.createElement = vi.fn(() => linkMock as any);
      const mockBlob = new Blob(['test'], { type: 'text/csv;charset=utf-8;' });
      global.Blob = vi.fn(() => mockBlob) as any;

      exportStatesToCSV(statesWithSpecialChars);

      expect(global.Blob).toHaveBeenCalledWith(
        expect.stringContaining('"California ""The Golden"""'),
        { type: 'text/csv;charset=utf-8;' }
      );
    });

    it('should handle export errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // Mock Blob to throw error
      global.Blob = vi.fn(() => {
        throw new Error('Blob creation failed');
      }) as any;

      exportStatesToCSV(mockStates);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to CSV:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export states to CSV. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('exportStatesToPDF', () => {
    it('should export states to PDF successfully', () => {
      const mockDoc = {
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        text: vi.fn(),
        autoTable: vi.fn(),
        internal: {
          getNumberOfPages: vi.fn(() => 1),
        },
        pageSize: {
          width: 210,
          height: 297,
        },
        save: vi.fn(),
      };

      const jsPDF = require('jspdf').default;
      jsPDF.mockReturnValue(mockDoc);

      exportStatesToPDF(mockStates);

      expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
      expect(mockDoc.text).toHaveBeenCalledWith('States Data', 14, 15);
      expect(mockDoc.text).toHaveBeenCalledWith(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);
      expect(mockDoc.text).toHaveBeenCalledWith(`Total States: ${mockStates.length}`, 14, 28);
      expect(mockDoc.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          head: [['S/N', 'State Name', 'State Code', 'State Leader', 'Region']],
          body: [
            ['1', 'California', 'CA', 'John Smith', 'West'],
            ['2', 'New York', 'NY', 'Jane Doe', 'East'],
          ],
        })
      );
      expect(mockDoc.save).toHaveBeenCalledWith(
        expect.stringMatching(/^states-data-\d{4}-\d{2}-\d{2}\.pdf$/)
      );
    });

    it('should handle empty states array', () => {
      const mockDoc = {
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        text: vi.fn(),
        autoTable: vi.fn(),
        internal: {
          getNumberOfPages: vi.fn(() => 1),
        },
        pageSize: {
          width: 210,
          height: 297,
        },
        save: vi.fn(),
      };

      const jsPDF = require('jspdf').default;
      jsPDF.mockReturnValue(mockDoc);

      exportStatesToPDF([]);

      expect(mockDoc.text).toHaveBeenCalledWith(`Total States: 0`, 14, 28);
      expect(mockDoc.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          body: [],
        })
      );
    });

    it('should handle export errors gracefully', () => {
      const jsPDF = require('jspdf').default;
      jsPDF.mockImplementation(() => {
        throw new Error('PDF creation failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      exportStatesToPDF(mockStates);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to PDF:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export states to PDF. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
});
