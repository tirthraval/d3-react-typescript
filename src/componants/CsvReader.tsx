import { useState } from "react"
import CSVReader from "react-csv-reader"
import TimeSeries, { Props } from "./TimeSeries"

const CsvReader  = ()=>{
    const [data , setData] = useState<Props[] | null>(null)
    const handleUploadCSV = (csvData : Props[])=>{
        setData(csvData)
    }
    return(<div>
        <CSVReader onFileLoaded={handleUploadCSV}
                    parserOptions = {{'header' : true}} />
        {data && <TimeSeries data = {data}/>}
    </div>)
}

export default CsvReader