// backend/src/services/email/templates/commonStyles.ts

export const commonStyles = `
<style>
  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f4f4;
  }
  .container {
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 20px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }
  .header p {
    margin: 10px 0 0;
    opacity: 0.9;
  }
  .content {
    padding: 30px;
    background-color: #ffffff;
  }
  .footer {
    background-color: #f8f9fa;
    padding: 20px;
    text-align: center;
    color: #666666;
    font-size: 14px;
    border-top: 1px solid #eeeeee;
  }
  .button {
    display: inline-block;
    padding: 12px 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white !important;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    margin: 20px 0;
    border: none;
    cursor: pointer;
  }
  .button:hover {
    opacity: 0.9;
  }
  .status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .status-pending {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
  }
  .status-processing {
    background-color: #cce5ff;
    color: #004085;
    border: 1px solid #b8daff;
  }
  .status-completed {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  .status-cancelled {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  .info-box {
    background-color: #f8f9fa;
    border-left: 4px solid #667eea;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  .table th {
    background-color: #f8f9fa;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
  }
  .table td {
    padding: 12px;
    border-bottom: 1px solid #dee2e6;
  }
  .total-row {
    font-weight: 600;
    background-color: #f8f9fa;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  .text-success {
    color: #28a745;
  }
  .text-warning {
    color: #ffc107;
  }
  .text-danger {
    color: #dc3545;
  }
  .text-primary {
    color: #007bff;
  }
  @media only screen and (max-width: 480px) {
    .container {
      width: 100% !important;
    }
    .content {
      padding: 20px !important;
    }
    .button {
      display: block !important;
      width: 100% !important;
    }
  }
</style>
`;