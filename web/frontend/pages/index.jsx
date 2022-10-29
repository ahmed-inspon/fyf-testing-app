import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
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

import { trophyImage } from "../assets";
import { ProductsCard } from "../components";
import { useEffect, useState,useCallback } from "react";
import {ColorModal} from "../components";
import PageHeader from "../components/PageHeader.jsx";
export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [unit,setUnit] = useState("cm");
  const [measurements,setMeasurements] = useState([]);
  const resourceName = {
    singular: 'Measurement',
    plural: 'Measurements',
  };

  const delete_measurement = async(id) =>{

    const response = await fetch("/api/measurements/"+id,{method:"DELETE",
              headers:{"accept":'application/json',"content-type":"application/json"}});
    if(response.ok){
      const resp = await response.json();
      if(resp.data && resp.data.measurements.length){
        setMeasurements(resp.data.measurements);
      }     
    }
  }

  const fetch_measurements = async () =>{
    const response = await fetch("/api/measurements",{method:"GET",
              headers:{"accept":'application/json',"content-type":"application/json"}});
    if(response.ok){
      const resp = await response.json();
      if(resp.data && resp.data.measurements.length){
        setMeasurements(resp.data.measurements);
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
            <Button onClick={()=>{delete_measurement(_id)}}>
            <Icon source={DeleteMinor}></Icon></Button></IndexTable.Cell>
        </IndexTable.Row>
      ),
    );
 
  console.log("rowMarkup",rowMarkup,measurements);
  const navigateHandler = () => {
    navigate('/measurements/create');
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
      <PageHeader/>
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
    </Page>
  );
}
