import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  IndexTable,
  useIndexResourceState,
  TextStyle,
  Navigation,
  Button,
  Icon
} from "@shopify/polaris";
import {EditMinor} from '@shopify/polaris-icons';
import { TitleBar,useNavigate } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

import { trophyImage } from "../assets";
import { ProductsCard } from "../components";
import { useEffect, useState } from "react";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [measurements,setMeasurements] = useState([]);
  const resourceName = {
    singular: 'Measurement',
    plural: 'Measurements',
  };
  const fetch_measurements = async () =>{
    const response = await fetch("/api/measurements",{method:"GET",
              headers:{"accept":'application/json',"content-type":"application/json"}});
    if(response.ok){
      const resp = await response.json();
      if(resp.data && resp.data.length){
        setMeasurements(resp.data);
      }
      console.log("measurements",resp);
    }
  }
  useEffect(()=>{
   
    fetch_measurements();
  },[])

  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(measurements,{resourceIDResolver:(row)=>{return row._id}});
  const rowMarkup = measurements.map(
    ({_id,neck,hips,pant, size, chest, waist}, index) => (
      <IndexTable.Row
        id={_id}
        key={_id}
        selected={selectedResources.includes(_id)}
        position={index}
      >
        <IndexTable.Cell>
          <TextStyle variation="strong">{size}</TextStyle>
        </IndexTable.Cell>
        <IndexTable.Cell>{neck}</IndexTable.Cell>
        <IndexTable.Cell>{chest}</IndexTable.Cell>
        <IndexTable.Cell>{waist}</IndexTable.Cell>
        <IndexTable.Cell>{hips}</IndexTable.Cell>
        <IndexTable.Cell>{pant}</IndexTable.Cell>
        <IndexTable.Cell><Button onClick={()=>{navigate('measurements/'+_id)}}>
          <Icon source={EditMinor}></Icon></Button></IndexTable.Cell>
      </IndexTable.Row>
    ),
  );
  const navigateHandler = () => {
    navigate('/create');
  }
  return (
    <Page narrowWidth>
      <TitleBar title="Find Your Fit - Manage"  primaryAction={{"content":"Create","onAction":navigateHandler}} />
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
              {/* <Heading>Manage Measurements</Heading> */}

              <IndexTable
                resourceName={resourceName}
                itemCount={measurements.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  {title: 'Size'},
                  {title: 'Neck'},
                  {title: 'Chest'},
                  {title: 'Waist'},
                  {title: 'Hips'},
                  {title: 'Pant'},
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
