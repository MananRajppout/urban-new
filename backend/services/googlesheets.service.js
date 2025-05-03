const { google } = require('googleapis');
const path = require('path');

// Initialize Google Sheets API client
const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(__dirname, '../v2/configs/credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

/**
 * Get headers from the specified sheet
*/
 async function getHeaders(spreadsheetId, sheetName) {
  const client = await auth.getClient();
  
  const sheets = google.sheets({ version: 'v4', auth: client });
  console.log("spreadsheetId", spreadsheetId);
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });

    return response.data.values?.[0] || [];
  } catch (error) {
    console.error('Error getting headers:', error);
    throw new Error('Failed to access sheet headers');
  }
}

/**
 * Get all rows from the specified sheet
 */
async function getAllRows(spreadsheetId, sheetName) {
  const client = await auth.getClient();
  
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error getting rows:', error);
    throw new Error('Failed to access sheet data');
  }
}

/**
 * Get a specific row from the sheet
 */
async function getNextRow(spreadsheetId, sheetName, rowIndex) {
  const client = await auth.getClient();
  
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${rowIndex}:${rowIndex}`,
    });

    const row = response.data.values?.[0];
    if (!row) return null;

    // Convert row array to object using headers
    const headers = await getHeaders(spreadsheetId, sheetName);
    return headers.reduce((obj, header, index) => {
      obj[header] = row[index] || '';
      return obj;
    }, {});
  } catch (error) {
    console.error('Error getting row:', error);
    throw new Error('Failed to access row data');
  }
}

/**
 * Update the status and summary of a specific row
 */
async function updateRowStatus(spreadsheetId, sheetName, rowIndex, status, summary = null) {
  const client = await auth.getClient();
  
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    const headers = await getHeaders(spreadsheetId, sheetName);
    const statusColumnIndex = headers.findIndex(header => 
      header.toLowerCase().includes('status'));
    const summaryColumnIndex = headers.findIndex(header => 
      header.toLowerCase().includes('summary'));

    const updates = [];

    // Handle status update
    if (statusColumnIndex === -1) {
      // If no status column exists, append one
      updates.push({
        range: `${sheetName}!${String.fromCharCode(65 + headers.length)}1`,
        values: [['Status']]
      });
      updates.push({
        range: `${sheetName}!${String.fromCharCode(65 + headers.length)}${rowIndex}`,
        values: [[status]]
      });
    } else {
      // Update existing status column
      updates.push({
        range: `${sheetName}!${String.fromCharCode(65 + statusColumnIndex)}${rowIndex}`,
        values: [[status]]
      });
    }

    // Handle summary update if provided
    if (summary !== null) {
      if (summaryColumnIndex === -1) {
        // If no summary column exists, append one
        updates.push({
          range: `${sheetName}!${String.fromCharCode(65 + headers.length + (statusColumnIndex === -1 ? 1 : 0))}1`,
          values: [['Summary']]
        });
        updates.push({
          range: `${sheetName}!${String.fromCharCode(65 + headers.length + (statusColumnIndex === -1 ? 1 : 0))}${rowIndex}`,
          values: [[summary]]
        });
      } else {
        // Update existing summary column
        updates.push({
          range: `${sheetName}!${String.fromCharCode(65 + summaryColumnIndex)}${rowIndex}`,
          values: [[summary]]
        });
      }
    }

    // Execute all updates in a single batch
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
    }
  } catch (error) {
    console.error('Error updating row status and summary:', error);
    throw new Error('Failed to update row status and summary');
  }
}

/**
 * Update call details in the sheet
 */
async function updateCallDetails(spreadsheetId, sheetName, rowIndex, details) {
  const client = await auth.getClient();
  
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    const headers = await getHeaders(spreadsheetId, sheetName);
    const updates = [];

    // Map details to corresponding columns
    for (const [key, value] of Object.entries(details)) {
      const columnIndex = headers.findIndex(header => 
        header.toLowerCase().includes(key.toLowerCase()));
      
      if (columnIndex !== -1) {
        updates.push({
          range: `${sheetName}!${String.fromCharCode(65 + columnIndex)}${rowIndex}`,
          values: [[value]]
        });
      }
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
    }
  } catch (error) {
    console.error('Error updating call details:', error);
    throw new Error('Failed to update call details');
  }
}

/**
 * Find row by phone number
 */
async function findRowByPhoneNumber(spreadsheetId, sheetName, phoneNumber, columnMappings) {
  console.log("Finding row by phone number:", phoneNumber);
  try {
    const rows = await getAllRows(spreadsheetId, sheetName);
    const headers = rows[0];
    
    // Find the phone number column using column mappings
    let phoneColumnIndex = -1;
    if (columnMappings) {
      const phoneColumnKey = Object.keys(columnMappings).find(key => 
        key.toLowerCase().includes('phone'));
      if (phoneColumnKey) {
        const mappedColumnName = columnMappings[phoneColumnKey];
        phoneColumnIndex = headers.findIndex(header => 
          header.toLowerCase() === mappedColumnName.toLowerCase());
      }
    }
    
    // Fallback to searching for 'phone' in header if no mapping found
    if (phoneColumnIndex === -1) {
      phoneColumnIndex = headers.findIndex(header => 
        header.toLowerCase().includes('phone'));
    }
    
    if (phoneColumnIndex === -1) {
      throw new Error('Phone number column not found');
    }

    // Clean the phone number for comparison
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    const rowIndex = rows.findIndex((row, index) => {
      if (index === 0) return false; // Skip header row
      const phone = row[phoneColumnIndex];
      if (!phone) return false;
      
      // Clean the phone number from the sheet for comparison
      const cleanSheetPhone = phone.toString().replace(/\D/g, '');
      return cleanSheetPhone === cleanPhoneNumber;
    });

    return rowIndex > 0 ? rowIndex + 1 : null;
  } catch (error) {
    console.error('Error finding row by phone number:', error);
    throw new Error('Failed to find row by phone number');
  }
}

/**
 * Validate sheet configuration
 */
async function validateSheetConfig(spreadsheetId, sheetName, columnMappings) {
  try {
    const headers = await getHeaders(spreadsheetId, sheetName);
    const requiredColumns = ['phone', 'name', 'status'];
    
    const missingColumns = requiredColumns.filter(required => 
      !headers.some(header => header.toLowerCase().includes(required)));

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const mappedColumns = Object.keys(columnMappings);
    const invalidMappings = mappedColumns.filter(col => 
      !headers.some(header => header.toLowerCase() === col.toLowerCase().replace(/[<>]/g, '')));

    if (invalidMappings.length > 0) {
      throw new Error(`Invalid column mappings: ${invalidMappings.join(', ')}`);
    }

    return true;
  } catch (error) {
    console.error('Error validating sheet config:', error);
    throw error;
  }
}

module.exports = {
  getHeaders,
  getAllRows,
  getNextRow,
  updateRowStatus,
  updateCallDetails,
  findRowByPhoneNumber,
  validateSheetConfig,
  getHeaders
}; 