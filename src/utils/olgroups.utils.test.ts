// utils/olgroups.utils.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyOldGroupsToClipboard, exportOldGroupsToExcel, exportOldGroupsToCSV, exportOldGroupsToPDF } from './olgroups.utils';
import type { OldGroup } from '@/types/oldGroups.type';

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

describe('OldGroups Utils', () => {
  const mockOldGroups: OldGroup[] = [
    {
      id: 1,
      name: 'First Church',
      leader: 'Pastor John',
      members: 50,
      district: 'Central District',
      state: 'California',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      id: 2,
      name: 'Second Church',
      leader: 'Pastor Jane',
      members: 75,
      district: 'North District',
      state: 'New York',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-04'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('copyOldGroupsToClipboard', () => {
    it('should copy old groups to clipboard successfully', async () => {
      await copyOldGroupsToClipboard(mockOldGroups);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('S/N\tGroup Name\tLeader\tMembers\tDistrict\tState\tCreated Date')
      );
    });

    it('should handle clipboard API failure with fallback', async () => {
      const mockError = new Error('Clipboard API failed');
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(mockError);

      await copyOldGroupsToClipboard(mockOldGroups);

      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should handle empty old groups array', async () => {
      await copyOldGroupsToClipboard([]);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('exportOldGroupsToExcel', () => {
    it('should export old groups to Excel successfully', () => {
      const { utils, writeFile } = require('xlsx');
      
      exportOldGroupsToExcel(mockOldGroups);

      expect(utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            'Group Name': 'First Church',
            'Leader': 'Pastor John',
            'Members': 50,
          }),
        ])
      );

      expect(utils.book_new).toHaveBeenCalled();
      expect(utils.book_append_sheet).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringMatching(/^oldgroups-data-\d{4}-\d{2}-\d{2}\.xlsx$/)
      );
    });

    it('should handle empty old groups array', () => {
      const { utils, writeFile } = require('xlsx');
      
      exportOldGroupsToExcel([]);

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

      exportOldGroupsToExcel(mockOldGroups);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to Excel:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export old groups to Excel. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('exportOldGroupsToCSV', () => {
    it('should export old groups to CSV successfully', () => {
      const linkMock = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: { visibility: 'hidden' },
      };

      global.document.createElement = vi.fn(() => linkMock as any);

      exportOldGroupsToCSV(mockOldGroups);

      expect(linkMock.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(linkMock.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/^oldgroups-data-\d{4}-\d{2}-\d{2}\.csv$/)
      );
      expect(linkMock.click).toHaveBeenCalled();
    });

    it('should handle old groups with special characters in CSV', () => {
      const oldGroupsWitSpecialChars: OldGroup[] = [
        {
          id: 1,
          name: 'First "The Best" Church',
          leader: 'Pastor "The Great" John',
          members: 50,
          district: 'Central "Main" District',
          state: 'California',
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

      exportOldGroupsToCSV(oldGroupsWitSpecialChars);

      expect(global.Blob).toHaveBeenCalledWith(
        expect.stringContaining('"First ""The Best"" Church"'),
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

      exportOldGroupsToCSV(mockOldGroups);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to CSV:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export old groups to CSV. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('exportOldGroupsToPDF', () => {
    it('should export old groups to PDF successfully', () => {
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

      exportOldGroupsToPDF(mockOldGroups);

      expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
      expect(mockDoc.text).toHaveBeenCalledWith('Old Groups Data', 14, 15);
      expect(mockDoc.text).toHaveBeenCalledWith(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);
      expect(mockDoc.text).toHaveBeenCalledWith(`Total Old Groups: ${mockOldGroups.length}`, 14, 28);
      expect(mockDoc.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          head: expect.arrayContaining(['S/N', 'Group Name']),
          body: expect.arrayContaining([
            expect.arrayContaining(['1', 'First Church']),
          ]),
        })
      );
      expect(mockDoc.save).toHaveBeenCalledWith(
        expect.stringMatching(/^oldgroups-data-\d{4}-\d{2}-\d{2}\.pdf$/)
      );
    });

    it('should handle empty old groups array', () => {
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

      exportOldGroupsToPDF([]);

      expect(mockDoc.text).toHaveBeenCalledWith(`Total Old Groups: 0`, 14, 28);
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

      exportOldGroupsToPDF(mockOldGroups);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to PDF:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export old groups to PDF. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
});
