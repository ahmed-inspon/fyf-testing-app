import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Modal,
  Select,
  Link,
  Heading,
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
  console.log("app------------->",app);
  const redirect = Redirect.create(app);
  const [connectThemeModal, toggleConnectThemeModal] = useState(false);


  const delete_measurement = useCallback(async()=>{
    if(deleteid){
      setdeletionloader(true);
      const response = await fetch("/api/measurements/"+deleteid,{method:"DELETE",
              headers:{"accept":'application/json',"content-type":"application/json"}});
      if(response.ok){
        const resp = await response.json();
        if(resp.data && resp.data.measurements.length){
          setMeasurements(resp.data.measurements);
        }     
      }
      setdeletionloader(false);
      handleChange();
      
    }
  },[deleteid]) 

  const fetch_measurements = async () =>{
    const response = await fetch("/api/measurements",{method:"GET",
              headers:{"accept":'application/json',"content-type":"application/json"}});
    if(response.ok){
      const resp = await response.json();
      if(resp.data && resp.data.measurements.length){
        setMeasurements(resp.data.measurements);
        let store_settings_ = resp.data.store_settings;
        if(store_settings_)
        {
          setstoreSettings(store_settings_);
        }
        if(!store_settings_ || 
          (store_settings_ && !store_settings_.theme_setup)){
            toggleConnectThemeModal(true);
            set_theme_setup();
          }
      }     
    }
  }
  useEffect(()=>{
    fetch_measurements();
  },[])


  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(measurements,{resourceIDResolver:(row)=>{return row._id}});
  const rowMarkup =  measurements.map(
      ({_id,title,gender,products}, index) => (
        <IndexTable.Row
          id={_id}
          key={_id}
          selected={selectedResources.includes(_id)}
          position={index}
        >
          <IndexTable.Cell>
            <TextStyle variation="strong">{title}</TextStyle>
          </IndexTable.Cell>
          <IndexTable.Cell>{gender}</IndexTable.Cell>
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
  const set_theme_setup = async()=>{
    const response = await fetch("/api/set_theme_setup",{method:"POST",
                                headers:{"accept":'application/json',
                                         "content-type":"application/json"}});
    const resp = await response.json();
        
        if(response.ok){
            console.log("resp",resp);
            if(resp.success){
              console.log(resp);
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
            console.log("resp",resp);
            if(resp.success){
              console.log(resp);
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
              <IndexTable
                resourceName={resourceName}
                itemCount={measurements.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  {title: 'Title'},
                  {title: 'Gender'},
                  {title: 'Products'},
                  {title: 'Action'},
                ]}
              >
                {rowMarkup}
              </IndexTable>
              </Stack.Item>
            </Stack>
          </Card>
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
