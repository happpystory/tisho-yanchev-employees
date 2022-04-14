import { useState } from "react";
import moment from "moment";

function App() {

  const [employeesPair, setEmployeesPair] = useState(null)

  const removeDuplicates = (finalData) => {
    finalData.forEach((el)=>{
      el.totalDays /= 2;
    })
  
    return finalData
  }

  const findCommonDays = (el, sub) => {
    let commonDays = 0;
      if(el.dateFrom <= sub.dateTo && el.dateTo >= sub.dateFrom) {
        let commonFrom = el.dateFrom;
        let commonTo = el.dateTo;

        if(sub.dateFrom > commonFrom) {
          commonFrom = sub.dateFrom;
        }
        
        if(sub.dateTo < commonTo) { 
          commonTo = sub.dateTo;
        }
        
        commonDays = commonTo.diff(commonFrom, 'days') + 1;
      }
      return commonDays
  }

  const createFinalElement = (employeePair, el, commonDays) => {
    return {
      employeePair,
      projectID: el.projectID,
      totalDays: commonDays
    }
  }

  const transformDate = (employees) => {
    employees.forEach((el) => {
       el.dateFrom = el.dateFrom === "NULL" ? moment() : moment(el.dateFrom);
       el.dateTo = el.dateTo === "NULL" ? moment() : moment(el.dateTo)
    })
  
    return employees
  }

  const findEmployeePair = (employees) => {
    let finalData = []
    const transformedData = transformDate(employees)

    transformedData.forEach((el) => {
      transformedData.forEach((sub) => {
        if(el.employeeID !== sub.employeeID && el.projectID === sub.projectID) { 

          let employeePair = [el.employeeID, sub.employeeID]
          let finalElement = null;

          finalData.forEach((finalEl) => {
            if(finalEl.employeePair.sort().join(",") === employeePair.sort().join(",")) {
              finalElement = finalEl;
            }
          })
        
          let commonDays = findCommonDays(el, sub)
         
          if(finalElement) {
            finalElement.totalDays += commonDays;
          } else {
            finalElement = createFinalElement(employeePair, el, commonDays)
            finalData.push(finalElement)
          }
        }
      })
    })

    const uniquePairs = removeDuplicates(finalData)
    return uniquePairs
  }

  const sortData = (employees) => {
    const employeePair = findEmployeePair(employees)

    employeePair.sort((a, b) => {
      return  b.totalDays - a.totalDays;
    })
    setEmployeesPair(employeePair[0])
  }

  const getData = (e) => {
    const file = e.target.files;
    const fr = new FileReader();
    fr.readAsText(file[0])
    fr.onload = () => {
      let employees = []
      let data = fr.result.split('\r\n')
      for(let i = 0; i < data.length; i++) { 
        let [employeeID, projectID, dateFrom, dateTo] = data[i].split(', ')
        let employee = {employeeID, projectID, dateFrom, dateTo}
        employees.push(employee)
      }

      sortData(employees)
    }
  }


  return (
    <div>
      <div id="import_header">
       <input type="file" onChange={getData} />
      </div>
      <table>
        <thead>
            <tr>
              <th className="header"><span className="column"><span>Employee ID #1</span></span></th>
              <th className="header"><span className="column"><span>Employee ID #2</span></span></th>
              <th className="header"><span className="column"><span>Project ID</span></span></th>
              <th className="header"><span className="column"><span>Days worked</span></span></th>
            </tr>
        </thead>
        <tbody>
          {employeesPair && 
          <tr>
            <td>{employeesPair.employeePair[0]}</td>
            <td>{employeesPair.employeePair[1]}</td>
            <td>{employeesPair.projectID}</td>
            <td>{employeesPair.totalDays}</td>
          </tr>}
        </tbody>
      </table>
    </div>
  );
}

export default App;
