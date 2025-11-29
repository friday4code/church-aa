// utils/users.utils.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyUsersToClipboard, exportUsersToExcel, exportUsersToCSV, exportUsersToPDF } from './users.utils';
import type { User } from '@/modules/admin/stores/users.store';

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

describe('Users Utils', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-04'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('copyUsersToClipboard', () => {
    it('should copy users to clipboard successfully', async () => {
      await copyUsersToClipboard(mockUsers);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'S/N\tFull Name\tEmail\tPhone\n' +
        '1\tJohn Doe\tjohn.doe@example.com\t+1234567890\n' +
        '2\tJane Smith\tjane.smith@example.com\t+0987654321'
      );
    });

    it('should handle clipboard API failure with fallback', async () => {
      const mockError = new Error('Clipboard API failed');
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(mockError);

      await copyUsersToClipboard(mockUsers);

      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should handle empty users array', async () => {
      await copyUsersToClipboard([]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('S/N\tFull Name\tEmail\tPhone\n');
    });
  });

  describe('exportUsersToExcel', () => {
    it('should export users to Excel successfully', () => {
      const { utils, writeFile } = require('xlsx');
      
      exportUsersToExcel(mockUsers);

      expect(utils.json_to_sheet).toHaveBeenCalledWith([
        {
          'S/N': 1,
          'First Name': 'John',
          'Last Name': 'Doe',
          'Full Name': 'John Doe',
          'Email': 'john.doe@example.com',
          'Phone': '+1234567890',
          'Created Date': '1/1/2023',
          'Updated Date': '1/2/2023',
        },
        {
          'S/N': 2,
          'First Name': 'Jane',
          'Last Name': 'Smith',
          'Full Name': 'Jane Smith',
          'Email': 'jane.smith@example.com',
          'Phone': '+0987654321',
          'Created Date': '1/3/2023',
          'Updated Date': '1/4/2023',
        },
      ]);

      expect(utils.book_new).toHaveBeenCalled();
      expect(utils.book_append_sheet).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringMatching(/^users-data-\d{4}-\d{2}-\d{2}\.xlsx$/)
      );
    });

    it('should handle empty users array', () => {
      const { utils, writeFile } = require('xlsx');
      
      exportUsersToExcel([]);

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

      exportUsersToExcel(mockUsers);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to Excel:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export users to Excel. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('exportUsersToCSV', () => {
    it('should export users to CSV successfully', () => {
      const linkMock = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: { visibility: 'hidden' },
      };

      global.document.createElement = vi.fn(() => linkMock as any);

      exportUsersToCSV(mockUsers);

      expect(linkMock.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(linkMock.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/^users-data-\d{4}-\d{2}-\d{2}\.csv$/)
      );
      expect(linkMock.click).toHaveBeenCalled();
    });

    it('should handle users with special characters in CSV', () => {
      const usersWithSpecialChars: User[] = [
        {
          id: 1,
          firstName: 'John "The"',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
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

      exportUsersToCSV(usersWithSpecialChars);

      expect(global.Blob).toHaveBeenCalledWith(
        expect.stringContaining('"John ""The"""'),
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

      exportUsersToCSV(mockUsers);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to CSV:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export users to CSV. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('exportUsersToPDF', () => {
    it('should export users to PDF successfully', () => {
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

      exportUsersToPDF(mockUsers);

      expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
      expect(mockDoc.text).toHaveBeenCalledWith('Users Data', 14, 15);
      expect(mockDoc.text).toHaveBeenCalledWith(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);
      expect(mockDoc.text).toHaveBeenCalledWith(`Total Users: ${mockUsers.length}`, 14, 28);
      expect(mockDoc.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          head: [['S/N', 'Full Name', 'Email', 'Phone']],
          body: [
            ['1', 'John Doe', 'john.doe@example.com', '+1234567890'],
            ['2', 'Jane Smith', 'jane.smith@example.com', '+0987654321'],
          ],
        })
      );
      expect(mockDoc.save).toHaveBeenCalledWith(
        expect.stringMatching(/^users-data-\d{4}-\d{2}-\d{2}\.pdf$/)
      );
    });

    it('should handle empty users array', () => {
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

      exportUsersToPDF([]);

      expect(mockDoc.text).toHaveBeenCalledWith(`Total Users: 0`, 14, 28);
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

      exportUsersToPDF(mockUsers);

      expect(consoleSpy).toHaveBeenCalledWith('Error exporting to PDF:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export users to PDF. Please try again.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
});
