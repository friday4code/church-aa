/**
 * PDF Generation utility for attendance defaulters report
 */

import { getCurrentMonthInfo, getStatusBadge } from './calendar-utils'

export interface DefaulterItem {
  id: number
  name: string
  level: 'State' | 'Region' | 'District' | 'Group' | 'Old Group'
  status: 'red' | 'orange' | 'yellow' | 'green'
  lastFilledWeek: number
  weeksOwed: number
  // Hierarchy fields
  state?: string
  state_id?: number
  region?: string
  region_id?: number
  old_group?: string
  old_group_id?: number
  groupName?: string
  groupId?: number
  district?: string
  district_id?: number
}

export interface GroupedData {
  id: number | string
  name: string
  items: DefaulterItem[]
  statusBreakdown: {
    red: number
    orange: number
    yellow: number
    green: number
  }
  subGroups?: GroupedData[] // For nested hierarchies
}

/**
 * Group defaulters by the selected hierarchy
 */
export function groupDefaultersByHierarchy(
  defaulters: DefaulterItem[], 
  hierarchy: string
): GroupedData[] {
  const groupedMap = new Map<string | number, GroupedData>()
  
  defaulters.forEach(item => {
    let groupId: string | number = 'unassigned'
    let groupName = 'Unassigned'
    
    // Determine grouping key based on hierarchy
    switch (hierarchy) {
      case 'state':
        groupId = item.state_id || 'unassigned'
        groupName = item.state || 'Unassigned State'
        break
      case 'region':
        groupId = item.region_id || 'unassigned'
        groupName = item.region || 'Unassigned Region'
        break
      case 'old_group':
        groupId = item.old_group_id || 'unassigned'
        groupName = item.old_group || 'Unassigned Old Group'
        break
      case 'group':
        groupId = item.groupId || 'unassigned'
        groupName = item.groupName || 'Unassigned Group'
        break
      case 'district':
        groupId = item.district_id || item.id
        groupName = item.name || 'Unassigned District'
        break
      default:
        groupId = 'all'
        groupName = 'All Items'
    }
    
    // Create or get the group
    if (!groupedMap.has(groupId)) {
      groupedMap.set(groupId, {
        id: groupId,
        name: groupName,
        items: [],
        statusBreakdown: { red: 0, orange: 0, yellow: 0, green: 0 }
      })
    }
    
    const group = groupedMap.get(groupId)!
    group.items.push(item)
    group.statusBreakdown[item.status]++
  })
  
  // Sort groups by name
  return Array.from(groupedMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  )
}

/**
 * Generate a PDF with dynamic hierarchy-based grouping
 */
export function generateDefaultersPDF(
  defaulters: DefaulterItem[], 
  hierarchy: string = 'group' // Default to group grouping
): void {
  if (defaulters.length === 0) {
    alert('No defaulters to report')
    return
  }

  const { month, year } = getCurrentMonthInfo()
  const timestamp = new Date().toLocaleString()
  
  // Group defaulters by selected hierarchy
  const groupedData = groupDefaultersByHierarchy(defaulters, hierarchy)

  // Count by status
  const redCount = defaulters.filter(d => d.status === 'red').length
  const orangeCount = defaulters.filter(d => d.status === 'orange').length
  const yellowCount = defaulters.filter(d => d.status === 'yellow').length
  const greenCount = defaulters.filter(d => d.status === 'green').length

  // Get hierarchy display name
  const hierarchyDisplayNames: Record<string, string> = {
    state: 'State',
    region: 'Region',
    old_group: 'Old Group',
    group: 'Group',
    district: 'District'
  }
  const hierarchyName = hierarchyDisplayNames[hierarchy] || 'Group'

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Attendance ${hierarchyName} Report - ${month} ${year}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            page { margin: 0; }
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
            background: white;
            color: #333;
            line-height: 1.6;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: bold;
          }
          
          .header p {
            font-size: 16px;
            margin: 5px 0;
            color: #666;
          }
          
          .info-box {
            background: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-size: 16px;
          }
          
          .info-box .label {
            font-weight: bold;
            display: inline-block;
            min-width: 150px;
          }
          
          .status-summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 25px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 5px;
          }
          
          .status-card {
            text-align: center;
            padding: 10px 20px;
            border-radius: 5px;
            min-width: 120px;
          }
          
          .status-card.red { background: #fee2e2; }
          .status-card.orange { background: #fff3cd; }
          .status-card.yellow { background: #fef9c3; }
          .status-card.green { background: #dcfce7; }
          
          .status-card .count {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
          }
          
          .legend {
            margin-bottom: 25px;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #333;
          }
          
          .legend h3 {
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 12px;
            font-weight: bold;
          }
          
          .legend-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .legend-item {
            font-size: 16px;
            padding: 5px 0;
          }
          
          .legend-badge {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 3px;
            margin-right: 10px;
            vertical-align: middle;
          }
          
          .badge-red { background: #dc2626; }
          .badge-orange { background: #f97316; }
          .badge-yellow { background: #eab308; }
          .badge-green { background: #16a34a; }
          
          .summary {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            padding: 15px;
            background: #e0f2fe;
            border-radius: 5px;
            text-align: center;
          }
          
          .hierarchy-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .hierarchy-header {
            background: #f0f0f0;
            padding: 15px 20px;
            border-bottom: 2px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .hierarchy-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: bold;
          }
          
          .hierarchy-stats {
            display: flex;
            gap: 15px;
          }
          
          .hierarchy-stat {
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
          }
          
          .hierarchy-stat.red { background: #fee2e2; color: #991b1b; }
          .hierarchy-stat.orange { background: #fff3cd; color: #92400e; }
          .hierarchy-stat.yellow { background: #fef9c3; color: #854d0e; }
          .hierarchy-stat.green { background: #dcfce7; color: #166534; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
          }
          
          th {
            background: #333;
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-size: 15px;
            font-weight: bold;
          }
          
          td {
            padding: 10px 15px;
            border-bottom: 1px solid #ddd;
          }
          
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            color: white;
            font-weight: bold;
            text-align: center;
            min-width: 70px;
            font-size: 13px;
          }
          
          .status-badge.red { background: #dc2626; }
          .status-badge.orange { background: #f97316; }
          .status-badge.yellow { background: #eab308; color: #000; }
          .status-badge.green { background: #16a34a; }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
          
          @media print {
            .status-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .status-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .hierarchy-stat { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Attendance Report by ${hierarchyName}</h1>
          <p><strong>${month} ${year}</strong></p>
        </div>
        
        <div class="info-box">
          <div><span class="label">Month:</span> ${month} ${year}</div>
          <div><span class="label">Generated:</span> ${timestamp}</div>
          <div><span class="label">Total Districts:</span> ${defaulters.length}</div>
          <div><span class="label">Grouped by:</span> ${hierarchyName}</div>
          <div><span class="label">Total Groups:</span> ${groupedData.length}</div>
        </div>
        
        <div class="status-summary">
          <div class="status-card red">
            <div>🔴 Red</div>
            <div class="count">${redCount}</div>
            <div>No submission</div>
          </div>
          <div class="status-card orange">
            <div>🟠 Orange</div>
            <div class="count">${orangeCount}</div>
            <div>2+ weeks behind</div>
          </div>
          <div class="status-card yellow">
            <div>🟡 Yellow</div>
            <div class="count">${yellowCount}</div>
            <div>1 week behind</div>
          </div>
          <div class="status-card green">
            <div>🟢 Green</div>
            <div class="count">${greenCount}</div>
            <div>Up to date</div>
          </div>
        </div>
        
        <div class="legend">
          <h3>Status Legend</h3>
          <div class="legend-grid">
            <div class="legend-item">
              <span class="legend-badge badge-red"></span>
              <strong>🔴 Red:</strong> Never submitted or no submission for full month
            </div>
            <div class="legend-item">
              <span class="legend-badge badge-orange"></span>
              <strong>🟠 Orange:</strong> 2+ weeks behind schedule
            </div>
            <div class="legend-item">
              <span class="legend-badge badge-yellow"></span>
              <strong>🟡 Yellow:</strong> 1 week behind schedule
            </div>
            <div class="legend-item">
              <span class="legend-badge badge-green"></span>
              <strong>🟢 Green:</strong> Up to date with submissions
            </div>
          </div>
        </div>
        
        <div class="summary">
          Report grouped by ${groupedData.length} ${hierarchyName}${groupedData.length !== 1 ? 's' : ''}
        </div>
        
        ${groupedData.map(group => `
          <div class="hierarchy-section">
            <div class="hierarchy-header">
              <h2>🏢 ${group.name}</h2>
              <div class="hierarchy-stats">
                <span class="hierarchy-stat red">🔴 ${group.statusBreakdown.red}</span>
                <span class="hierarchy-stat orange">🟠 ${group.statusBreakdown.orange}</span>
                <span class="hierarchy-stat yellow">🟡 ${group.statusBreakdown.yellow}</span>
                <span class="hierarchy-stat green">🟢 ${group.statusBreakdown.green}</span>
                <span style="font-weight: bold; margin-left: 10px;">Total: ${group.items.length}</span>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>District Name</th>
                  ${hierarchy !== 'district' ? `<th>${hierarchyName}</th>` : ''}
                  <th>Status</th>
                  <th>Weeks Owed</th>
                  <th>Last Submitted</th>
                </tr>
              </thead>
              <tbody>
                ${group.items.map((item, index) => {
                  const statusInfo = getStatusBadge(item.status)
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td style="font-weight: 500;">${item.name}</td>
                      ${hierarchy !== 'district' ? `
                        <td>
                          ${hierarchy === 'state' ? item.state || 'N/A' : ''}
                          ${hierarchy === 'region' ? item.region || 'N/A' : ''}
                          ${hierarchy === 'old_group' ? item.old_group || 'N/A' : ''}
                          ${hierarchy === 'group' ? item.groupName || 'N/A' : ''}
                        </td>
                      ` : ''}
                      <td>
                        <span class="status-badge ${item.status}">
                          ${statusInfo.emoji} ${statusInfo.label}
                        </span>
                      </td>
                      <td style="text-align: center; font-weight: bold;">${item.weeksOwed}</td>
                      <td style="text-align: center;">${item.lastFilledWeek === 0 ? 'Never' : `Week ${item.lastFilledWeek}`}</td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>This report includes ${defaulters.length} districts grouped by ${hierarchyName}.</p>
          <p>Generated by Church Attendance System • ${timestamp}</p>
          <p>Powered by SPEEDLINK HI-TECH SOLUTIONS X Paradox</p>
        </div>
      </body>
    </html>
  `

  // Create and open a new window with the HTML
  const printWindow = window.open('', '', 'width=900,height=600')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.onload = () => printWindow.print()
  }
}

// Keep the old function for backward compatibility if needed
export function generateDefaultersPDFLegacy(defaulters: DefaulterItem[]): void {
  return generateDefaultersPDF(defaulters, 'group')
}












// /**
//  * PDF Generation utility for attendance defaulters report
//  */

// import { getCurrentMonthInfo, getStatusBadge } from './calendar-utils'

// export interface DefaulterItem {
//   id: number
//   name: string
//   level: 'State' | 'Region' | 'District' | 'Group' | 'Old Group'
//   status: 'red' | 'orange' | 'yellow' | 'green'
//   lastFilledWeek: number
//   weeksOwed: number
//   groupName?: string  // Add this
//   groupId?: number    // Add this
// }

// export interface GroupedDefaulterData {
//   groupId: number
//   groupName: string
//   districts: DefaulterItem[]
//   statusBreakdown: {
//     red: number
//     orange: number
//     yellow: number
//     green: number
//   }
// }

// /**
//  * Group defaulters by group name
//  */
// /**
//  * Group defaulters by group name
//  */
// export function groupDefaultersByGroup(defaulters: DefaulterItem[]): GroupedDefaulterData[] {
//   const groupedMap = new Map<number, GroupedDefaulterData>()
  
//   // First, separate districts with groups from those without
//   const districtsWithGroups = defaulters.filter(d => d.groupId && d.groupName);
//   const districtsWithoutGroups = defaulters.filter(d => !d.groupId || !d.groupName);
  
//   console.log('Districts with groups:', districtsWithGroups.length);
//   console.log('Districts without groups:', districtsWithoutGroups.length);
  
//   // Group districts that have groups
//   districtsWithGroups.forEach(defaulter => {
//     const groupId = defaulter.groupId!;
//     const groupName = defaulter.groupName!;
    
//     if (!groupedMap.has(groupId)) {
//       groupedMap.set(groupId, {
//         groupId: groupId,
//         groupName: groupName,
//         districts: [],
//         statusBreakdown: { red: 0, orange: 0, yellow: 0, green: 0 }
//       });
//     }
    
//     const group = groupedMap.get(groupId)!;
//     group.districts.push(defaulter);
//     group.statusBreakdown[defaulter.status]++;
//   });
  
//   // Add "Unassigned Districts" group for districts without groups
//   if (districtsWithoutGroups.length > 0) {
//     groupedMap.set(-1, {
//       groupId: -1,
//       groupName: 'Unassigned Districts',
//       districts: districtsWithoutGroups,
//       statusBreakdown: {
//         red: districtsWithoutGroups.filter(d => d.status === 'red').length,
//         orange: districtsWithoutGroups.filter(d => d.status === 'orange').length,
//         yellow: districtsWithoutGroups.filter(d => d.status === 'yellow').length,
//         green: districtsWithoutGroups.filter(d => d.status === 'green').length
//       }
//     });
//   }
  
//   // Sort groups by name
//   return Array.from(groupedMap.values()).sort((a, b) => 
//     a.groupName.localeCompare(b.groupName)
//   );
// }

// // export function groupDefaultersByGroup(defaulters: DefaulterItem[]): GroupedDefaulterData[] {
// //   const groupedMap = new Map<number, GroupedDefaulterData>()
  
// //   defaulters.forEach(defaulter => {
// //     if (!defaulter.groupId) {
// //       // Handle districts without a group - put in "Unassigned" group
// //       const unassignedId = -1
// //       if (!groupedMap.has(unassignedId)) {
// //         groupedMap.set(unassignedId, {
// //           groupId: unassignedId,
// //           groupName: 'Unassigned Districts',
// //           districts: [],
// //           statusBreakdown: { red: 0, orange: 0, yellow: 0, green: 0 }
// //         })
// //       }
// //       const group = groupedMap.get(unassignedId)!
// //       group.districts.push(defaulter)
// //       group.statusBreakdown[defaulter.status]++
// //       return
// //     }
    
// //     if (!groupedMap.has(defaulter.groupId)) {
// //       groupedMap.set(defaulter.groupId, {
// //         groupId: defaulter.groupId,
// //         groupName: defaulter.groupName || `Group ${defaulter.groupId}`,
// //         districts: [],
// //         statusBreakdown: { red: 0, orange: 0, yellow: 0, green: 0 }
// //       })
// //     }
    
// //     const group = groupedMap.get(defaulter.groupId)!
// //     group.districts.push(defaulter)
// //     group.statusBreakdown[defaulter.status]++
// //   })
  
// //   // Sort groups by name
// //   return Array.from(groupedMap.values()).sort((a, b) => 
// //     a.groupName.localeCompare(b.groupName)
// //   )
// // }

// /**
//  * Generate a PDF for defaulters grouped by groups
//  */
// export function generateDefaultersPDF(defaulters: DefaulterItem[]): void {
//   if (defaulters.length === 0) {
//     alert('No defaulters to report')
//     return
//   }

//   const { month, year } = getCurrentMonthInfo()
//   const timestamp = new Date().toLocaleString()
  
//   // Group defaulters by group
//   const groupedData = groupDefaultersByGroup(defaulters)

//   // Count by status
//   const redCount = defaulters.filter(d => d.status === 'red').length
//   const orangeCount = defaulters.filter(d => d.status === 'orange').length
//   const yellowCount = defaulters.filter(d => d.status === 'yellow').length
//   const greenCount = defaulters.filter(d => d.status === 'green').length

//   // Generate HTML content
//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Attendance Defaulters Report - ${month} ${year}</title>
//         <style>
//           @media print {
//             body { margin: 0; padding: 0; }
//             page { margin: 0; }
//           }
          
//           body {
//             font-family: Arial, sans-serif;
//             margin: 20px;
//             padding: 20px;
//             background: white;
//             color: #333;
//             line-height: 1.6;
//           }
          
//           .header {
//             text-align: center;
//             margin-bottom: 30px;
//             border-bottom: 3px solid #333;
//             padding-bottom: 20px;
//           }
          
//           .header h1 {
//             font-size: 28px;
//             margin: 0 0 10px 0;
//             font-weight: bold;
//           }
          
//           .header p {
//             font-size: 16px;
//             margin: 5px 0;
//             color: #666;
//           }
          
//           .info-box {
//             background: #f5f5f5;
//             padding: 15px;
//             margin-bottom: 20px;
//             border-radius: 5px;
//             font-size: 16px;
//           }
          
//           .info-box .label {
//             font-weight: bold;
//             display: inline-block;
//             min-width: 150px;
//           }
          
//           .status-summary {
//             display: flex;
//             justify-content: space-around;
//             margin-bottom: 25px;
//             padding: 20px;
//             background: #f9f9f9;
//             border-radius: 5px;
//           }
          
//           .status-card {
//             text-align: center;
//             padding: 10px 20px;
//             border-radius: 5px;
//             min-width: 120px;
//           }
          
//           .status-card.red { background: #fee2e2; }
//           .status-card.orange { background: #fff3cd; }
//           .status-card.yellow { background: #fef9c3; }
//           .status-card.green { background: #dcfce7; }
          
//           .status-card .count {
//             font-size: 24px;
//             font-weight: bold;
//             margin: 5px 0;
//           }
          
//           .legend {
//             margin-bottom: 25px;
//             padding: 15px;
//             background: #f9f9f9;
//             border-left: 4px solid #333;
//           }
          
//           .legend h3 {
//             font-size: 18px;
//             margin-top: 0;
//             margin-bottom: 12px;
//             font-weight: bold;
//           }
          
//           .legend-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//             gap: 15px;
//           }
          
//           .legend-item {
//             font-size: 16px;
//             padding: 5px 0;
//           }
          
//           .legend-badge {
//             display: inline-block;
//             width: 20px;
//             height: 20px;
//             border-radius: 3px;
//             margin-right: 10px;
//             vertical-align: middle;
//           }
          
//           .badge-red { background: #dc2626; }
//           .badge-orange { background: #f97316; }
//           .badge-yellow { background: #eab308; }
//           .badge-green { background: #16a34a; }
          
//           .summary {
//             font-size: 18px;
//             font-weight: bold;
//             margin-bottom: 20px;
//             padding: 15px;
//             background: #e0f2fe;
//             border-radius: 5px;
//             text-align: center;
//           }
          
//           .group-section {
//             margin-bottom: 30px;
//             border: 1px solid #ddd;
//             border-radius: 8px;
//             overflow: hidden;
//           }
          
//           .group-header {
//             background: #f0f0f0;
//             padding: 15px 20px;
//             border-bottom: 2px solid #333;
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//           }
          
//           .group-header h2 {
//             margin: 0;
//             font-size: 20px;
//             font-weight: bold;
//           }
          
//           .group-stats {
//             display: flex;
//             gap: 15px;
//           }
          
//           .group-stat {
//             padding: 5px 10px;
//             border-radius: 4px;
//             font-size: 14px;
//             font-weight: bold;
//           }
          
//           .group-stat.red { background: #fee2e2; color: #991b1b; }
//           .group-stat.orange { background: #fff3cd; color: #92400e; }
//           .group-stat.yellow { background: #fef9c3; color: #854d0e; }
//           .group-stat.green { background: #dcfce7; color: #166534; }
          
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 15px;
//           }
          
//           th {
//             background: #333;
//             color: white;
//             padding: 12px 15px;
//             text-align: left;
//             font-size: 15px;
//             font-weight: bold;
//           }
          
//           td {
//             padding: 10px 15px;
//             border-bottom: 1px solid #ddd;
//           }
          
//           tr:nth-child(even) {
//             background: #f9f9f9;
//           }
          
//           .status-badge {
//             display: inline-block;
//             padding: 4px 8px;
//             border-radius: 3px;
//             color: white;
//             font-weight: bold;
//             text-align: center;
//             min-width: 70px;
//             font-size: 13px;
//           }
          
//           .status-badge.red { background: #dc2626; }
//           .status-badge.orange { background: #f97316; }
//           .status-badge.yellow { background: #eab308; color: #000; }
//           .status-badge.green { background: #16a34a; }
          
//           .footer {
//             margin-top: 40px;
//             padding-top: 20px;
//             border-top: 2px solid #ddd;
//             font-size: 14px;
//             color: #666;
//             text-align: center;
//           }
          
//           @media print {
//             .status-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//             .status-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//             .group-stat { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h1>📋 Attendance Defaulters Report</h1>
//           <p><strong>${month} ${year}</strong></p>
//         </div>
        
//         <div class="info-box">
//           <div><span class="label">Month:</span> ${month} ${year}</div>
//           <div><span class="label">Generated:</span> ${timestamp}</div>
//           <div><span class="label">Total Districts:</span> ${defaulters.length}</div>
//           <div><span class="label">Total Groups:</span> ${groupedData.length}</div>
//         </div>
        
//         <div class="status-summary">
//           <div class="status-card red">
//             <div>🔴 Red</div>
//             <div class="count">${redCount}</div>
//             <div>No submission</div>
//           </div>
//           <div class="status-card orange">
//             <div>🟠 Orange</div>
//             <div class="count">${orangeCount}</div>
//             <div>2+ weeks behind</div>
//           </div>
//           <div class="status-card yellow">
//             <div>🟡 Yellow</div>
//             <div class="count">${yellowCount}</div>
//             <div>1 week behind</div>
//           </div>
//           <div class="status-card green">
//             <div>🟢 Green</div>
//             <div class="count">${greenCount}</div>
//             <div>Up to date</div>
//           </div>
//         </div>
        
//         <div class="legend">
//           <h3>Status Legend</h3>
//           <div class="legend-grid">
//             <div class="legend-item">
//               <span class="legend-badge badge-red"></span>
//               <strong>🔴 Red:</strong> Never submitted or no submission for full month
//             </div>
//             <div class="legend-item">
//               <span class="legend-badge badge-orange"></span>
//               <strong>🟠 Orange:</strong> 2+ weeks behind schedule
//             </div>
//             <div class="legend-item">
//               <span class="legend-badge badge-yellow"></span>
//               <strong>🟡 Yellow:</strong> 1 week behind schedule
//             </div>
//             <div class="legend-item">
//               <span class="legend-badge badge-green"></span>
//               <strong>🟢 Green:</strong> Up to date with submissions
//             </div>
//           </div>
//         </div>
        
//         <div class="summary">
//           Report grouped by ${groupedData.length} Group${groupedData.length !== 1 ? 's' : ''}
//         </div>
        
//         ${groupedData.map(group => `
//           <div class="group-section">
//             <div class="group-header">
//               <h2>🏢 ${group.groupName}</h2>
//               <div class="group-stats">
//                 <span class="group-stat red">🔴 ${group.statusBreakdown.red}</span>
//                 <span class="group-stat orange">🟠 ${group.statusBreakdown.orange}</span>
//                 <span class="group-stat yellow">🟡 ${group.statusBreakdown.yellow}</span>
//                 <span class="group-stat green">🟢 ${group.statusBreakdown.green}</span>
//                 <span style="font-weight: bold; margin-left: 10px;">Total: ${group.districts.length}</span>
//               </div>
//             </div>
            
//             <table>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>District Name</th>
//                   <th>Status</th>
//                   <th>Weeks Owed</th>
//                   <th>Last Submitted</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${group.districts.map((item, index) => {
//                   const statusInfo = getStatusBadge(item.status)
//                   return `
//                     <tr>
//                       <td>${index + 1}</td>
//                       <td style="font-weight: 500;">${item.name}</td>
//                       <td>
//                         <span class="status-badge ${item.status}">
//                           ${statusInfo.emoji} ${statusInfo.label}
//                         </span>
//                       </td>
//                       <td style="text-align: center; font-weight: bold;">${item.weeksOwed}</td>
//                       <td style="text-align: center;">${item.lastFilledWeek === 0 ? 'Never' : `Week ${item.lastFilledWeek}`}</td>
//                     </tr>
//                   `
//                 }).join('')}
//               </tbody>
//             </table>
//           </div>
//         `).join('')}
        
//         <div class="footer">
//           <p>This report includes ${defaulters.length} districts across ${groupedData.length} groups.</p>
//           <p>Generated by Church Attendance System • ${timestamp}</p>
//           <p>Powered by SPEEDLINK HI-TECH SOLUTIONS X Paradox</p>

//         </div>
//       </body>
//     </html>
//   `

//   // Create and open a new window with the HTML
//   const printWindow = window.open('', '', 'width=900,height=600')
//   if (printWindow) {
//     printWindow.document.write(htmlContent)
//     printWindow.document.close()
//     printWindow.onload = () => printWindow.print()
//   }
// }
