import React, { useState, useEffect } from 'react';
import './App.css';
import {MenuItem,FormControl,Select,Card,CardContent,Typography} from "@material-ui/core"
import InfoBox from './InfoBox';
import Map from './Map'
import Table from './Table'
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
function App() {

  //https://disease.sh/v3/covid-19/countries

  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry]= useState("worldwide")
  const [countryInfo,setCountryInfo] = useState({})
  const [tableData,setTabledata]=useState([]);
  const [mapCenter, setMapCenter] = 
                 useState({lat: 34.80746, lng:-40.4796})
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response)=> response.json())
    .then((data)=> {
       setCountryInfo(data)
    })
    
  }, [])// we can use two useeffect

  useEffect(() => {
    const getCountries= async ()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
       .then((response)=> response.json())
       .then((data)=> {
         const countries= data.map((country)=>(
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
         ));
         const sortedData= sortData(data)
         setTabledata(sortedData)
         setMapCountries(data)
         setCountries(countries)
       } );

      
    }

    getCountries();
  }, [])

  const onCountryChange=async(e)=>{
      const countryCode= e.target.value;
      
   //https://disease.sh/v3/covid-19/countries/India
    const url= countryCode==='worldwide' ?
           "https://disease.sh/v3/covid-19/all":
           `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
    .then((response)=> response.json())
    .then (data => {
               setSelectedCountry(countryCode)
               setCountryInfo(data)
               console.log(data)
               if(countryCode==='worldwide'){
                setMapCenter([ 34.80746, 40.4796])
               }
               else{
                 setMapCenter([data.countryInfo.lat,data.countryInfo.long])
               }
               setMapZoom(4);
            })
  }
  
  
  return (
    <div className="app">
      <div className="app_left">
      <div className="app_header">
      <h1>COVID-19 TRACKER</h1>
      <FormControl className="app_dropdown">
        <Select variant="outlined" value={selectedCountry} onChange={onCountryChange}>
        <MenuItem value="worldwide">worldwide</MenuItem>
          {
            countries.map((country)=>(
              <MenuItem value={country.value}>{country.name}</MenuItem>
            ))
          }
          
        </Select>
      </FormControl>
      </div>
      <div className="app_stats">
        <InfoBox isRed active={casesType==="cases"} onClick={e=> setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrintStat( countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
        <InfoBox  active={casesType==="recovered"} onClick={e=> setCasesType('recovered')} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
        <InfoBox isRed active={casesType==="deaths"} onClick={e=> setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
      </div>
      <Map countries={mapCountries} center={mapCenter} zoom={mapZoom} casesType={casesType} />
      </div>
      <Card className="app_right">
          <CardContent>
            <h3>Live cases by country</h3>
            <Table countries={tableData} />
        <h3 className="app_cardHead5">Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType}/>
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
