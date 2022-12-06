import { TitleBar ,useNavigate} from '@shopify/app-bridge-react';
import {FormLayout,Toast,Banner, Checkbox,Frame, TextField,Select, Button, Page, Layout, Card} from '@shopify/polaris';
import {useState, useCallback, useEffect} from 'react';
import { useAppQuery, useAuthenticatedFetch } from "../../hooks";
import { useParams } from "react-router-dom";

import Form from '../../components/form';
export default () => {
  const [gender, setgender] = useState('m');
  const [chest, setchest] = useState('');
  const [waist, setwaist] = useState('');
  const [size, setsize] = useState('');
  const [neck, setneck] = useState('');
  const [hips, sethips] = useState('');
  const [pant, setpant] = useState('');
  const fetch = useAuthenticatedFetch();
  const [loading,setloading] = useState(true);
  const [unit,setUnit] = useState("Centimeters");
  const [measurement,setMeasurement] = useState();
  const { id } = useParams();
  const options = [
    {label: 'Male', value: 'm'},
    {label: 'Female', value: 'f'}
  ];
  const navigate = useNavigate();

  const sizes = [
    {label: 'XS', value: 'xs'},
    {label: 'S', value: 's'},
    {label: 'M', value: 'm'},
    {label: 'L', value: 'l'},
    {label: 'XL', value: 'xl'},
    {label: '2XL', value: '2xl'},
    {label: '3XL', value: '3xl'},

  ];
  const fetch_measurement = async ()=>{
    const response = await fetch("/api/measurements/"+id,{method:"GET",
    headers:{"accept":'application/json',"content-type":"application/json"}});
    if(response.ok){
      const resp = await response.json();
      if(resp.data && resp.data.measurements){
        setMeasurement(resp.data.measurements);
        setloading(false);
      }     
    }
    setloading(false);
  }
  useEffect(()=>{
    if(id && id != "create"){
    fetch_measurement();
    }
    else{
      setloading(false);
    }
  },[])
  // const [toast, settoast] = useState({active:false,"error":false,"title":""});

  const [banner, setbanner] = useState({active:false,"status":"info","title":"","details":""});
  const togglebanner = useCallback(() => setbanner({...banner,active:!banner.active}), []);
  // const offtoast = useCallback(() => settoast({...toast,active:false}), []);
  // const ontoast = useCallback(() => settoast({...toast,active:true}), []);

  const handlesubmit = async (measurement,cb) => {
    
    // setloading(true);
    const response = await fetch("/api/measurements/create_update",{method:"POST",
                                headers:{"accept":'application/json',
                                         "content-type":"application/json"},
                                body:JSON.stringify(measurement)});
    const resp = await response.json();
        
        if(response.ok){
            if(resp.success){
                cb();
                let mesg = "Measurement created";
                if(id && id != "create"){
                  mesg = "Measurement updated";
                }
                setTimeout(()=>{
                  console.log("testing")
                  navigate("/",{target:'self'});
                },500);
                // settoast({"active":true,"error":false,"title":mesg});
            }
            else{
                setbanner({"active":true,"error":true,"title":"Error","details":resp.error});
            }
         }else{
            setbanner({"active":true,"error":true,"title":"Error","details":resp.error});
         }
         cb();
        
  };
  // const toastMarkup = useCallback(()=>{
  //   return toast.active ? (
  //     <Toast error={toast.error} content={toast.title} onDismiss={()=>{offtoast()}}></Toast>
  //   ): null;
  // },[toast]) ;
  const handlegenderChange = useCallback((value) => setgender(value), []);
  const handlesizeChange = useCallback((value) => setsize(value), []);
  const handlewaistChange = useCallback((value) => setwaist(value), []);
  const handlechestChange = useCallback((value) => setchest(value), []);
  const handleneckChange = useCallback((value) => setneck(value), []);
  const handlepantChange = useCallback((value) => setpant(value), []);
  const handlehipsChange = useCallback((value) => sethips(value), []);

  return (
    <Frame>
    <Page narrowWidth>
      <TitleBar title={`Find Your Fit - ${(!loading && measurement ) ? "Update Sizing Chart" : "Create Sizing Chart"}`}/>
        {banner.active ?
        <Banner title={banner.title} status='critical' onDismiss={() => {togglebanner()}}>
            <p>{banner.details}</p>
        </Banner> : null }
        <Layout>
            <Layout.Section>
            {!loading ? (    
                <Card sectioned>
                                
                  <Form handlesubmit={handlesubmit} measurement={measurement}/>
                </Card>
                ):null}
            </Layout.Section>
        </Layout>
        {/* {toastMarkup} */}
    </Page>
    </Frame>
   
  );
}