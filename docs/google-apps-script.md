# Google Apps Script Integration

The LBS MCA platform uses Google Apps Script to synchronize registrations and status updates with a Google Sheet.

## 📝 Script Logic

### Deployment Instructions
1. Open a Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Create two new files: `Code.gs` and `SetupSheet.gs`.
4. Copy the code below into each respective file.
5. Update `SHEET_ID` with your actual Google Sheet ID.
6. Click **Deploy > New Deployment**.
7. Select **Type: Web App**, **Execute as: Me**, and **Who has access: Anyone**.
8. Copy the **Web App URL** and set it as `APPS_SCRIPT_URL` in your environment variables.

---

### Code.gs
```javascript
function doPost(e) {
  try {
    const SHEET_ID = "1vg9K8CEr29DDzp_w4Wt9h03msm7-vY0T4KcY03O_7A4";
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0]; 
    const parameters = e.parameter;
    
    // Check if this is a Status Update request from the Admin Dashboard
    if (parameters.action === "updateStatus") {
      const emailToFind = parameters.email;
      const newStatus = parameters.status;
      
      if (!emailToFind || !newStatus) {
         throw new Error("Missing email or status for update.");
      }
      
      const data = sheet.getDataRange().getValues();
      let updated = false;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === emailToFind) { 
          sheet.getRange(i + 1, 10).setValue(newStatus); 
          updated = true;
          break;
        }
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({ "status": "success", "message": updated ? "Status updated" : "Email not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Otherwise, this is a normal new registration
    const rowData = [
      new Date(),
      parameters.name || "",
      parameters.email || "",
      parameters.phone || "",
      parameters.whatsapp || "",
      parameters.graduationYear || "",
      parameters.selectedPackage || "",
      parameters.transactionId || "",
      parameters.screenshotUrl || "",
      parameters.status || "Pending"
    ];
    
    if (sheet.getLastRow() === 0) {
      const headers = ["Timestamp", "Name", "Email", "Phone Number", "WhatsApp Number", "Graduation Year", "Selected Package", "Transaction ID", "Screenshot URL", "Status"];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success", "message": "Record inserted" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
```

### SetupSheet.gs
```javascript
function setupSheet() {
  const SHEET_ID = "1vg9K8CEr29DDzp_w4Wt9h03msm7-vY0T4KcY03O_7A4";
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheets()[0]; 
  
  if (sheet.getLastRow() === 0) {
    const headers = ["Timestamp", "Name", "Email", "Phone Number", "WhatsApp Number", "Graduation Year", "Selected Package", "Transaction ID", "Screenshot URL", "Status"];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert("✅ Success! Your sheet headers have been created.");
  } else {
    SpreadsheetApp.getUi().alert("⚠️ Your sheet already has data in it. Setup skipped.");
  }
}
```
