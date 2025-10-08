import express, { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import path from 'path';
import { FieldsConfig } from '../models';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';

const router = express.Router();

/**
 * @route   GET /api/template/download
 * @desc    Download import template based on current field configuration
 * @access  Public
 */
router.get('/download', asyncHandler(async (req: Request, res: Response) => {
  const { format = 'xlsx' } = req.query;

  try {
    // Get all visible fields sorted by order
    const fieldsConfig = await FieldsConfig.find({ visible: true }).sort({ order: 1 });

    if (fieldsConfig.length === 0) {
      throw new ApiError(404, 'No field configurations found. Please initialize fields first.');
    }

    // Filter out file type fields and create headers
    const headers = fieldsConfig
      .filter(field => field.type !== 'file')
      .map(field => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || '',
        enumValues: field.enumValues || []
      }));

    // Create sample data row with placeholders
    const sampleRow: any = {};
    headers.forEach(header => {
      if (header.enumValues.length > 0) {
        sampleRow[header.label] = header.enumValues[0]; // First option as example
      } else if (header.type === 'date') {
        sampleRow[header.label] = '2024-01-15';
      } else if (header.type === 'number') {
        sampleRow[header.label] = '100';
      } else if (header.type === 'phone') {
        sampleRow[header.label] = '1234567890';
      } else if (header.type === 'email') {
        sampleRow[header.label] = 'example@email.com';
      } else {
        sampleRow[header.label] = header.placeholder || `Sample ${header.label}`;
      }
    });

    // Create instructions row
    const instructionsRow: any = {};
    headers.forEach(header => {
      let instruction = `${header.type}`;
      if (header.required) {
        instruction += ' (Required)';
      }
      if (header.enumValues.length > 0) {
        instruction += ` - Options: ${header.enumValues.join(', ')}`;
      }
      instructionsRow[header.label] = instruction;
    });

    if (format === 'csv') {
      // Generate CSV
      const createCsvWriter = require('csv-writer').createObjectCsvWriter;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `import-template-${timestamp}.csv`;
      const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

      const csvWriter = createCsvWriter({
        path: filepath,
        header: headers.map(h => ({ id: h.label, title: h.label }))
      });

      await csvWriter.writeRecords([instructionsRow, sampleRow]);

      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up file after sending
        setTimeout(() => {
          if (require('fs').existsSync(filepath)) {
            require('fs').unlinkSync(filepath);
          }
        }, 60000);
      });
    } else {
      // Generate XLSX
      const workbook = XLSX.utils.book_new();
      
      // Instructions sheet
      const instructionsSheet = XLSX.utils.json_to_sheet([
        {
          'Column Name': 'Instructions',
          'Description': 'This template is based on your current field configuration.'
        },
        {
          'Column Name': 'Required Fields',
          'Description': headers.filter(h => h.required).map(h => h.label).join(', ') || 'None'
        },
        {
          'Column Name': 'Total Fields',
          'Description': `${headers.length} fields configured`
        },
        {},
        { 'Column Name': 'Field Name', 'Description': 'Type & Validation' }
      ].concat(
        headers.map(h => ({
          'Column Name': h.label,
          'Description': `${h.type}${h.required ? ' (Required)' : ''}${
            h.enumValues.length > 0 ? ` - Options: ${h.enumValues.join(', ')}` : ''
          }`
        }))
      ));

      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

      // Data template sheet
      const dataSheet = XLSX.utils.json_to_sheet([sampleRow]);
      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');

      // Generate filename and write file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `import-template-${timestamp}.xlsx`;
      const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

      XLSX.writeFile(workbook, filepath);

      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up file after sending
        setTimeout(() => {
          if (require('fs').existsSync(filepath)) {
            require('fs').unlinkSync(filepath);
          }
        }, 60000);
      });
    }
  } catch (error) {
    console.error('Template generation error:', error);
    throw new ApiError(500, 'Failed to generate template');
  }
}));

export default router;

