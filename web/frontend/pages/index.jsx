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
import {EditMinor} from '@shopify/polaris-icons';
import { TitleBar,useNavigate } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

import { trophyImage } from "../assets";
import { ProductsCard } from "../components";
import { useEffect, useState,useCallback } from "react";
import {ColorModal} from "../components";
export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [unit,setUnit] = useState("cm");
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

  const [fontColor,setFontColor] = useState('#000000');
  const [bgColor,setbgColor] = useState('#000000');

  const fontColor_activator = (
    <div
      style={{
        width: "100%",
        height: "35px",
        backgroundColor: fontColor,
        border: "1px solid gray",
        cursor: "pointer",
      }}
      onClick={() => {
        setFontColorModal(true);
      }}
    />
  );

  const bgColor_activator = (
    <div
      style={{
        width: "100%",
        height: "35px",
        backgroundColor: bgColor,
        border: "1px solid gray",
        cursor: "pointer",
      }}
      onClick={() => {
        setbgColorModal(true);
      }}
    />
  );
  const handleUnitChange = useCallback((value) => setUnit(value), []);
  const [fontColorModal,setFontColorModal] = useState(false);
  const [bgColorModal,setbgColorModal] = useState(false);

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
        <Layout.Section>
        <Heading>Store Settings</Heading>
          <Card sectioned>
            <FormLayout>
              <Select
                    label="Measurement Unit"
                    options={["cm","inches"]}
                    onChange={handleUnitChange}
                    value={unit}
                    helpText={<span>
                      Default Unit Of Your Store For Measurements
                      </span>}
                />
                <Label>Select Color Of Fonts</Label>
                <ColorModal 
                colorPickerModal={fontColorModal}
                setColorPickerModal={() => setFontColorModal((c) => !c)}
                activator={fontColor_activator}
                color={fontColor}
                onAccept={(color) => {
                  setFontColor(color);
                }}
                />
                <Label>Select Color Of Background</Label>
                <ColorModal 
                colorPickerModal={bgColorModal}
                setColorPickerModal={() => setbgColorModal((c) => !c)}
                activator={bgColor_activator}
                color={bgColor}
                onAccept={(color) => {
                  setbgColor(color);
                }}
                />
                <Button onClick={handleUpdate}>Update</Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
