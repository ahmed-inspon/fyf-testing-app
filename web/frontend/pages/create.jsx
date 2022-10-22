import { TitleBar } from '@shopify/app-bridge-react';
import {Form, FormLayout,Toast,Banner, Checkbox,Frame, TextField,Select, Button, Page, Layout, Card} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export default () => {
  const [newsletter, setNewsletter] = useState(false);
  const [gender, setgender] = useState('m');
  const [chest, setchest] = useState('');
  const [waist, setwaist] = useState('');
  const [size, setsize] = useState('');
  const [neck, setneck] = useState('');
  const [hips, sethips] = useState('');
  const [pant, setpant] = useState('');
  const fetch = useAuthenticatedFetch();
  const [unit,setUnit] = useState("Centimeters");
  const options = [
    {label: 'Male', value: 'm'},
    {label: 'Female', value: 'f'}
  ];

  const sizes = [
    {label: 'XS', value: 'xs'},
    {label: 'S', value: 's'},
    {label: 'M', value: 'm'},
    {label: 'L', value: 'l'},
    {label: 'XL', value: 'xl'},
    {label: '2XL', value: '2xl'},
    {label: '3XL', value: '3xl'},

  ];
  const [toast, settoast] = useState({active:false,"error":false,"title":""});

  const [banner, setbanner] = useState({active:false,"status":"info","title":"","details":""});
  const [loading,setloading] = useState(false);
  const togglebanner = useCallback(() => setbanner({...banner,active:!banner.active}), []);
  const toggletoast = useCallback(() => settoast({...toast,active:!toast.active}), []);

  const handleSubmit = async () => {
    
    setloading(true);
    // console.log("testing started",chest,waist,size);
    const response = await fetch("/api/measurements/create",{method:"POST",
                                headers:{"accept":'application/json',
                                         "content-type":"application/json"},
                                body:JSON.stringify({chest,waist,size,gender,neck,hips,pant})});
    const resp = await response.json();
        
        if(response.ok){
            console.log("resp",resp);
            if(resp.success){
                setneck('');
                setchest('');
                setwaist('');
                setsize('');
                setpant('');
                sethips('');
                settoast({"active":true,"error":false,"title":"Measurement created"});
            }
            else{
                setbanner({"active":true,"error":true,"title":"Error","details":resp.error});
            }
         }else{
            setbanner({"active":true,"error":true,"title":"Error","details":resp.error});
         }
         setloading(false);
        
  };
  const toastMarkup = toast.active ? (
    <Toast error={toast.error} content={toast.title} onDismiss={()=>{toggletoast()}}></Toast>
  ): null;
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
        <TitleBar title="Find Your Fit - Create Measurement"/>
        {banner.active ?
        <Banner title={banner.title} status='critical' onDismiss={() => {togglebanner()}}>
            <p>{banner.details}</p>
        </Banner> : null }
        <Layout>
            <Layout.Section>
                <Card sectioned>
                    <Form onSubmit={handleSubmit}>
                        <FormLayout>
                            <Select
                                label="Gender"
                                options={options}
                                onChange={handlegenderChange}
                                value={gender}
                            />
                            <Select
                                label="Size"
                                options={sizes}
                                onChange={handlesizeChange}
                                value={size}
                                helpText={
                                    <span>
                                    Size of your clothing
                                    </span>
                                }
                            />
                            {/* <TextField
                            value={size}
                            onChange={handlesizeChange}
                            label="Size"
                            type="text"
                            autoComplete="size"
                            helpText={
                                <span>
                                Size of your clothing
                                </span>
                            }
                            /> */}
                           {gender == "m" ? <TextField
                            value={neck}
                            onChange={handleneckChange}
                            label={`Neck (${unit})`}
                            type="number"
                            autoComplete="neck"
                            helpText={
                                <span>
                                Neck of your clothing in {unit}
                                </span>
                            }
                            /> : null }
                            <TextField
                            value={chest}
                            onChange={handlechestChange}
                            label={`${gender == "m" ? "Chest":"Bust"} (${unit})`}
                            type="number"
                            autoComplete="chest"
                            helpText={
                                <span>
                                {gender == "m" ? "Chest":"Bust"} of your clothing in {unit}
                                </span>
                            }
                            />
                            <TextField
                            value={waist}
                            onChange={handlewaistChange}
                            label={`Waist (${unit})`}
                            type="number"
                            autoComplete="waist"
                            helpText={
                                <span>
                                waist of your clothing in {unit}
                                </span>
                            }
                            />
                            {gender == "f" ? <TextField
                            value={hips}
                            onChange={handlehipsChange}
                            label={`Hips (${unit})`}
                            type="number"
                            autoComplete="hips"
                            helpText={
                                <span>
                                Hips of your clothing in {unit}
                                </span>
                            }
                            />:null}
                            <TextField
                            value={pant}
                            onChange={handlepantChange}
                            label={`Pant Length (${unit})`}
                            type="number"
                            autoComplete="pant"
                            helpText={
                                <span>
                                Pant length of your clothing in {unit}
                                </span>
                            }
                            />

                            <Button loading={loading} submit>Submit</Button>
                        </FormLayout>
                    </Form>
                </Card>
            </Layout.Section>
        </Layout>
        {toastMarkup}
    </Page>
    </Frame>
   
  );
}