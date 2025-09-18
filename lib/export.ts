import * as XLSX from 'xlsx'
import { Client, ExportFormat } from '@/types'

export interface ExportData {
  filename: string;
  data: ArrayBuffer;
  mimeType: string;
}

// Convert clients to export format
function formatClientForExport(client: Client) {
  return {
    'Client Name': client.name,
    'Mobile Number': client.mobile,
    'Email': client.email,
    'Services Taken': client.servicesTaken.join(', '),
    'Last Visit': client.lastVisit.toLocaleDateString(),
    'Next Due Date': client.nextDueDate.toLocaleDateString(),
    'Days Until Due': Math.ceil((client.nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    'Status': client.nextDueDate < new Date() ? 'Overdue' : 'Active',
    'Total Appointments': client.appointmentHistory.length,
    'Notes': client.notes || '',
    'Created Date': client.createdAt?.toLocaleDateString() || ''
  };
}

// Export clients to CSV
export function exportToCSV(clients: Client[]): ExportData {
  const exportData = clients.map(formatClientForExport);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const data = new TextEncoder().encode(csv).buffer;
  
  return {
    filename: `salon-clients-${new Date().toISOString().split('T')[0]}.csv`,
    data: data,
    mimeType: 'text/csv'
  };
}

// Export clients to Excel
export function exportToExcel(clients: Client[]): ExportData {
  const exportData = clients.map(formatClientForExport);
  
  // Create workbook with multiple sheets
  const workbook = XLSX.utils.book_new();
  
  // Main clients sheet
  const clientsSheet = XLSX.utils.json_to_sheet(exportData);
  
  // Auto-size columns
  const maxWidth = 25;
  const columnWidths = Object.keys(exportData[0] || {}).map(key => {
    const maxLength = Math.max(
      key.length,
      ...exportData.map(row => String(row[key as keyof typeof row] || '').length)
    );
    return { wch: Math.min(maxWidth, Math.max(10, maxLength + 2)) };
  });
  
  clientsSheet['!cols'] = columnWidths;
  XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clients');
  
  // Summary sheet
  const summary = {
    'Total Clients': clients.length,
    'Active Clients': clients.filter(c => c.nextDueDate >= new Date()).length,
    'Overdue Clients': clients.filter(c => c.nextDueDate < new Date()).length,
    'Due This Week': clients.filter(c => {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return c.nextDueDate >= new Date() && c.nextDueDate <= weekFromNow;
    }).length,
  };
  
  const summarySheet = XLSX.utils.json_to_sheet([summary]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Service analysis sheet
  const serviceStats = clients.reduce((acc: Record<string, number>, client) => {
    client.servicesTaken.forEach(service => {
      acc[service] = (acc[service] || 0) + 1;
    });
    return acc;
  }, {});
  
  const serviceAnalysis = Object.entries(serviceStats)
    .sort(([, a], [, b]) => b - a)
    .map(([service, count]) => ({
      'Service': service,
      'Client Count': count,
      'Percentage': `${((count / clients.length) * 100).toFixed(1)}%`
    }));
  
  const serviceSheet = XLSX.utils.json_to_sheet(serviceAnalysis);
  XLSX.utils.book_append_sheet(workbook, serviceSheet, 'Service Analysis');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  return {
    filename: `salon-clients-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    data: excelBuffer.buffer,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
}

// Main export function
export function exportClients(clients: Client[], format: ExportFormat = 'xlsx'): ExportData {
  switch (format) {
    case 'csv':
      return exportToCSV(clients);
    case 'xlsx':
      return exportToExcel(clients);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// Export appointment history for a specific client
export function exportClientHistory(client: Client, format: ExportFormat = 'xlsx'): ExportData {
  const historyData = client.appointmentHistory.map(appointment => ({
    'Date': appointment.date.toLocaleDateString(),
    'Service': appointment.service,
    'Price': appointment.price ? `$${appointment.price.toFixed(2)}` : 'N/A',
    'Status': appointment.status,
    'Notes': appointment.notes || ''
  }));
  
  if (format === 'csv') {
    const worksheet = XLSX.utils.json_to_sheet(historyData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const data = new TextEncoder().encode(csv).buffer;
    
    return {
      filename: `${client.name.replace(/[^a-zA-Z0-9]/g, '_')}-history-${new Date().toISOString().split('T')[0]}.csv`,
      data: data,
      mimeType: 'text/csv'
    };
  }
  
  // Excel format
  const workbook = XLSX.utils.book_new();
  const historySheet = XLSX.utils.json_to_sheet(historyData);
  
  // Add client info sheet
  const clientInfo = {
    'Client Name': client.name,
    'Mobile': client.mobile,
    'Email': client.email,
    'Last Visit': client.lastVisit.toLocaleDateString(),
    'Next Due Date': client.nextDueDate.toLocaleDateString(),
    'Total Appointments': client.appointmentHistory.length,
    'Total Spent': client.appointmentHistory
      .filter(a => a.price)
      .reduce((sum, a) => sum + (a.price || 0), 0)
      .toFixed(2)
  };
  
  const clientSheet = XLSX.utils.json_to_sheet([clientInfo]);
  
  XLSX.utils.book_append_sheet(workbook, clientSheet, 'Client Info');
  XLSX.utils.book_append_sheet(workbook, historySheet, 'Appointment History');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  return {
    filename: `${client.name.replace(/[^a-zA-Z0-9]/g, '_')}-history-${new Date().toISOString().split('T')[0]}.xlsx`,
    data: excelBuffer.buffer,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
}