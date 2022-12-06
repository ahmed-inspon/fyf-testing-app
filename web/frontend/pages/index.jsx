import {
  Card,
  Page,
  Banner,
  Layout,
  TextContainer,
  Image,
  Stack,
  Modal,
  Select,
  Link,
  // Heading,
  IndexTable,
  useIndexResourceState,
  TextStyle,
  Navigation,
  Button,
  Icon,
  FormLayout,
  TextField,
  Label,
} from "@shopify/polaris";
import {Heading} from '../components';
import {EditMinor,DeleteMinor} from '@shopify/polaris-icons';
import { TitleBar,useNavigate } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import { trophyImage } from "../assets";
import { ProductsCard } from "../components";
import { useEffect, useState,useCallback } from "react";
import {ColorModal} from "../components";
import PageHeader from "../components/PageHeader.jsx";
import ConnectThemeModal from '../components/ConnectThemeModal.jsx'
export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [unit,setUnit] = useState("cm");
  const [measurements,setMeasurements] = useState([]);
  const resourceName = {
    singular: 'Measurement',
    plural: 'Measurements',
  };
  const [active, setActive] = useState(false);
  const [dataloading,setdataloading] = useState(true);
  const [storeSettings, setstoreSettings] = useState(null);
  const handleChange = useCallback(() => setActive(!active), [active]);
  const [deleteid,setdeleteid] = useState(null);
  const [deletionLoader,setdeletionloader] = useState(false);
  const delete_measurement_confirm = (id) => {
    if(id){
      setdeleteid(id);
      handleChange();
    }
    
  }
  // function delete_measurement(){
  //   if(deleteid){
  //     alert(deleteid);
  //   }
  // }
  /**
   * Creating App Birdge instance
   */
  const app = useAppBridge();
  const store_url = app.hostOrigin.replace("https://","");
  const redirect = Redirect.create(app);
  const [banner1,setbanner1] = useState(true);
  const [banner2,setbanner2] = useState(true);
  const [connectThemeModal, toggleConnectThemeModal] = useState(false);
  const get_type = useCallback((type)=>{
    const types = [
      { label: 'General Clothing', value: 'ge_ap',graphs:'neck,chest,shirt_length,sleeves,waist,hips,pant' },
      { label: 'Women`s Shirts Without Sleeves', value: 'wo_sh',graphs:'neck,chest,shirt_length' },
      { label: 'Women`s Shirts With Sleeves', value: 'wo_sh_sl',graphs:'neck,chest,shirt_length,sleeves' },
      { label: 'Men`s Shirts Without Sleeves', value: 'me_sh',graphs:'neck,chest,shirt_length' },
      { label: 'Men`s Shirts With Sleeves', value: 'me_sh_sl',graphs:'neck,chest,shirt_length,sleeves' },
      { label: 'Women`s Pants', value: 'wo_pa',graphs:'waist,hips,pant' },
      { label: 'Men`s Pants', value: 'me_pa' ,graphs:'waist,pant' },
      { label: 'Men`s Shorts', value: 'me_sho' ,graphs:'waist' },
  ]
   let t = types.filter((t)=> t.value == type);
   if(t && t.length){
    return t[0].label;
   }
   return "";
  },[]);

  const delete_measurement = async()=>{
    if(deleteid){
      setdeletionloader(true);
      const response = await fetch("/api/measurements/"+deleteid,{method:"DELETE",
              headers:{"accept":'application/json',"content-type":"application/json"}});
      if(response.ok){
        const resp = await response.json();
        if(resp.data ){
          setMeasurements(resp.data.measurements);
        }     
      }
      setdeletionloader(false);
      handleChange();
      
    }
  } 

  const fetch_measurements = async () =>{
    setdataloading(true);
    const response = await fetch("/api/measurements",{method:"GET",
              headers:{"accept":'application/json',"content-type":"application/json"}});
    if(response.ok){
      const resp = await response.json();
      let store_settings_ = resp?.data?.store_settings;
      if(resp.data && resp.data.measurements.length){
        setMeasurements(resp.data.measurements);
        if(store_settings_)
        {
          setstoreSettings(store_settings_);
          setdataloading(false);
        }
      }  
      if(!store_settings_ || 
        (store_settings_ && !store_settings_.theme_setup)){
          toggleConnectThemeModal(true);
          set_theme_setup();
        }   
    }
    setdataloading(false);
  }
  useEffect(()=>{
    fetch_measurements();
  },[])


  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(measurements,{resourceIDResolver:(row)=>{return row._id}});
  const rowMarkup =  measurements.map(
      ({_id,title,type,products}, index) => (
        <IndexTable.Row
          id={_id}
          key={_id}
          selected={selectedResources.includes(_id)}
          position={index}
        >
          <IndexTable.Cell>
            <TextStyle variation="strong">{title}</TextStyle>
          </IndexTable.Cell>
          <IndexTable.Cell>{get_type(type)}</IndexTable.Cell>
          <IndexTable.Cell>{products.length}</IndexTable.Cell>
          <IndexTable.Cell><Button onClick={()=>{navigate('/measurements/'+_id)}}>
            <Icon source={EditMinor}></Icon></Button>
            <span style={{marginLeft:12}}>
            <Button onClick={()=>{delete_measurement_confirm(_id)}} >
            <Icon source={DeleteMinor}></Icon></Button>
            </span>
           </IndexTable.Cell>
        </IndexTable.Row>
      ),
    );
 
  const navigateHandler = () => {
    navigate('/measurements/create');
  }

  const contactSupport = () =>{
    window.open('mailto:app-support@sellquicky.com', '_blank');
  }

  const enableAppWidget = () =>{
    toggleConnectThemeModal(true);
  }

  const set_theme_setup = async()=>{
    const response = await fetch("/api/set_theme_setup",{method:"POST",
                                headers:{"accept":'application/json',
                                         "content-type":"application/json"}});
    const resp = await response.json();
        
        if(response.ok){
            if(resp.success){
            }
        }
  }
  const handleUpdate = async()=>{
    console.log(bgColor,fontColor,unit);
    let obj = {unit,bgColor,fontColor};
    const response = await fetch("/api/store_settings",{method:"POST",
                                headers:{"accept":'application/json',
                                         "content-type":"application/json"},
                                body:JSON.stringify(obj)});
    const resp = await response.json();
        
        if(response.ok){
            if(resp.success){
            }
        }
  }
  return (
    <Page>
      <TitleBar title="Find Your Fit - Manage"  primaryAction={{"content":"Create","onAction":navigateHandler}} />
      <PageHeader connectTheme={toggleConnectThemeModal}/>
      <br></br>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="loose"
              distribution="fill"
              alignment="center"
            >
              <Stack.Item>
                {banner1 ?
                <div style={{'marginBottom':'2rem'}}>
                <Banner title="Step 1" onDismiss={() => {setbanner1(false)}}>
                  <Heading>Enable App Widget In Your Theme.</Heading>
                  <div style={{marginBottom:'1rem'}}></div>
                  <Button onClick={()=>toggleConnectThemeModal(true)}>Enable App Widget</Button>

                </Banner>
                </div>:null}
              {((measurements && measurements.length) || dataloading) ?
              <>
              <div style={{marginTop:'1rem'}}></div>
              <div style={{'display':'flex','justifyContent':'space-between'}}>
                <Heading style={{textAlign:'left'}}>Size Charts</Heading>
                <Button onClick={()=>navigateHandler()}>Create Sizing Chart</Button>

              </div>
              <div style={{marginBottom:'1rem'}}></div>
              <IndexTable
                resourceName={resourceName}
                itemCount={measurements.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  {title: 'Title'},
                  {title: 'Type'},
                  {title: 'Products'},
                  {title: 'Action'},
                ]}
              >
                {rowMarkup}
              </IndexTable></> :
              <div>
                {(banner2 && !dataloading) ?
                <Banner title="Step 2" onDismiss={() => {setbanner2(false)}}>
                  <Heading>Define Your Sizes And Target Products On Which You Want To Show Charts. </Heading>
                  <div style={{marginBottom:'1rem'}}></div>
                  <Button onClick={()=>navigateHandler()}>Create Sizing Chart</Button>
                </Banner> :                  
                 <Button onClick={()=>navigateHandler()}>Create Sizing Chart</Button>}
              </div>
              }
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          
            <Stack
                wrap={false}
                spacing="loose"
                distribution="fill"
                alignment="center"
              >
                <Stack.Item>
                  <div
                   >
                    <Card title="Can't see App Widget?"
                    sectioned
                    primaryFooterAction={
                      {content: 'Enable App Widget',onAction:enableAppWidget}}
                    >
                      <p>Make sure you enable App Widget on your currently active theme.</p>
                      <p><strong>(Note)</strong> App Widget will still need a sizing chart and product selected.</p>
                    </Card>
                  </div>
                </Stack.Item>
                <Stack.Item>
                  <div
                   >
                    <Card title="Stuck in setting up App?"
                    sectioned
                    primaryFooterAction={{content: 'Contact Support',onAction:contactSupport}}
                    >
                      <p>Do you need help enabling App-Widget, or any other query?</p>
                      <p>Contact support to get your query resolved in less than 12 hours.</p>
                    </Card>
                  </div>
                </Stack.Item>
              </Stack>
        </Layout.Section>
      </Layout>
      <Modal
        title={"Delete Sizing Chart?"}
        open={active}
        onClose={handleChange}
        primaryAction={{
          loading:deletionLoader,
          destructive:true,
          content: 'Confirm',
          onAction: delete_measurement,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleChange
          }
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              You are about to delete sizing chart, this action is irreversable, all the products showing this sizing chart will not be able to show chart.
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
      <ConnectThemeModal
              store={store_url}
              redirect={redirect}
              enableStore={() => {
                // setStoreData({ ...store, theme_block_enabled: true });
              }}
              visible = {connectThemeModal}
              // visible={storeData.theme_block_enabled === false ? true : connectThemeModal}
              onClose={() => toggleConnectThemeModal(false)}
      />
    </Page>
  );
}
