import { TitleBar,ResourcePicker } from '@shopify/app-bridge-react';
import { Form, FormLayout, Toast, Banner,Checkbox, Frame, TextField, Select, Button, Page, Layout, Card, DataTable } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { Heading as HeadingWrapper,ListItem } from '../components';
export default (props) => {

    const fetch = useAuthenticatedFetch();
    const [id,setid] = useState(null);
    const [gender, setgender] = useState('m');
    // const [chest, setchest] = useState('');
    // const [waist, setwaist] = useState('');
    const [size, setsize] = useState('');
    // const [neck, setneck] = useState('');
    // const [hips, sethips] = useState('');
    // const [pant, setpant] = useState('');
    const [type, settype] = useState('');
    const [unit, setUnit] = useState("Centimeters");
    const [resourcePicker, toggleResourcePicker] = useState(false);
    const [products,setProducts] = useState([]);
    const [sizes, setSizes] = useState([
        { label: 'XS', value: 'xs', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
        { label: 'S', value: 's', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
        { label: 'M', value: 'm', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
        { label: 'L', value: 'l', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
        { label: 'XL', value: 'xl', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
        { label: '2XL', value: '2xl', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
        { label: '3XL', value: '3xl', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },

    ]);
    // const options = [
    //     { label: 'Male', value: 'm' },
    //     { label: 'Female', value: 'f' }
    // ];
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
    const handleUnitChange = useCallback((value) => setUnit(value), []);

    useEffect(()=>{
        if(props.measurement){
            let measurement = props.measurement;
            setProducts(measurement.products);
            setgender(measurement.gender);
            setSizes(measurement.sizes);
            settitle(measurement.title);
            setid(measurement._id);
            setUnit(measurement.unit);
            settype(measurement.type);
        }

    },[])

    const fetch_settings = async () =>{
        const response = await fetch("/api/store_settings",{method:"GET",
                  headers:{"accept":'application/json',"content-type":"application/json"}});
        if(response.ok){
          const resp = await response.json();
          if(resp.data && resp.data){
            // if(resp.data.appearance){
            //   setappearance(resp.data.appearance);
            // }
            if(!props.measurement){
                setUnit(resp.data.unit);
            }
          }     
        }
      }
      useEffect(()=>{
        fetch_settings();
      },[])

    
    //   const [measurements,setMeasurements] = useState([
    //     {size}
    //   ]);
    const [loading, setLoading] = useState(false);
    const [title, settitle] = useState("");

    const handlegenderChange = useCallback((value) => setgender(value), []);
    const handlesizeChange = useCallback((s,key,value) =>
    {
        let sizes_ = [...sizes];
        sizes_.forEach((a,i)=>{
            if(a.label == s.label && (value > 0 || value == ""))
            {
                sizes_[i][key] = value;
            }
        })
        setSizes(sizes_);
    }
    , [sizes]);

    const handletypeChange = useCallback((value)=> settype(value),[]);
    const handletitleChange = useCallback((value) => settitle(value), []);
    const handlesubmit = () => {
        if(!products.length){
            alert("Please choose product(s) to show App Widget.");
            return
        }
        setLoading(true);
        props.handlesubmit({id,type, gender, size,  unit,sizes,title,products }, () => {
            settitle("");
            setProducts([]);
            setSizes([
                { label: 'XS', value: 'xs', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
                { label: 'S', value: 's', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
                { label: 'M', value: 'm', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
                { label: 'L', value: 'l', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
                { label: 'XL', value: 'xl', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
                { label: '2XL', value: '2xl', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
                { label: '3XL', value: '3xl', neck: '', chest: '', waist: '', hips: '', sleeves: '', shirt_length: '', pant: '' },
        
            ]);
            // setneck('');
            // setchest('');
            // setwaist('');
            // setsize('');
            // setpant('');
            // sethips('');
            setLoading(false);
        });
    }
    const render_graph_header = useCallback(()=>{
        let type_ = type;
        let graph_ = types.filter((t)=>{return t.value == type_});
        let graphs = ["neck","chest","shirt_length","waist","sleeves","hips","pant"];
        if(graph_ && graph_.length)
        {
            graphs = graph_[0].graphs.split(",");
        }
        return (
            <tr>
            <th>Size</th>
            {graphs.includes("neck") && <th>Neck</th>}
            {graphs.includes("chest") && <th>Chest</th>}
            {graphs.includes("sleeves") && <th>Sleeves</th>}
            {graphs.includes("shirt_length") && <th>Shirt Length</th>}
            {graphs.includes("waist") && <th>Waist</th>}
            {graphs.includes("hips") && <th>Hips</th>}
            {graphs.includes("pant") && <th>Pant Length</th>}
            </tr>)
    },[type]);

    const render_graph_body = useCallback(()=>{
        let type_ = type;
        let graph_ = types.filter((t)=>{return t.value == type_});
        let graphs = ["neck","chest","shirt_length","waist","sleeves","hips","pant"];
        if(graph_ && graph_.length)
        {
            graphs = graph_[0].graphs.split(",");
        }
        return(
            sizes.map((s) => {
                return (
                        <tr key={s.label}>
                        <th>{s.label}</th>
                        {graphs.includes("neck") && <td><TextField
                            value={s.neck}
                            type={"number"}
                            onChange={(val)=>handlesizeChange(s,'neck',val)}
                            autoComplete={s.value+"_neck"}                                    />
                        </td>}
                        {graphs.includes("chest") && <td><TextField
                            value={s.chest}
                            onChange={(val)=>handlesizeChange(s,'chest',val)}
                            type="number"
                            autoComplete={s.value+"_chest"}
                        /></td>}
                         {graphs.includes("sleeves") && <td><TextField
                            value={s.sleeves}
                            onChange={(val)=>handlesizeChange(s,'sleeves',val)}
                            type="number"
                            autoComplete={s.value+"_sleeves"}
                        /></td>}
                        {graphs.includes("shirt_length") && <td><TextField
                            value={s.shirt_length}
                            onChange={(val)=>handlesizeChange(s,'shirt_length',val)}
                            type="number"
                            autoComplete={s.value+"_length"}
                        /></td>}
                        {graphs.includes("waist") && <td><TextField
                            value={s.waist}
                            onChange={(val)=>handlesizeChange(s,'waist',val)}
                            type="number"
                            autoComplete={s.value+"_waist"}
                        /></td> }
                        {graphs.includes("hips") && <td><TextField
                            value={s.hips}
                            onChange={(val)=>handlesizeChange(s,'hips',val)}
                            type="number"
                            autoComplete={s.value+"_hips"}
                        /></td> }
                       {graphs.includes("pant") && <td><TextField
                            value={s.pant}
                            onChange={(val)=>handlesizeChange(s,'pant',val)}
                            type="number"
                            autoComplete={s.value+"_pant"}
                        /></td> }
                    </tr>
                )
            })
        );
    },[sizes,type])
    return (
        <Form onSubmit={handlesubmit}>
            
            <FormLayout>
                <HeadingWrapper size="16px" weight={400} style={{ marginBottom: 8 }}>
                    1. Name your measurement chart and define your local or standard sizes in {unit} :
                </HeadingWrapper>
                <TextField 
                label={"Title"}
                value={title}
                onChange={handletitleChange}
                />
                <Select
                      label="Measurement Unit"
                      options={["Centimeters","Inches"]}
                      onChange={handleUnitChange}
                      value={unit}
                  />
                 <Select
                    label="Apparel Type"
                    options={types}
                    onChange={handletypeChange}
                    value={type}
                />
                <hr />
                <table style={{width:'100%'}}>
                    <thead>
                        {render_graph_header()}
                    </thead>
                    <tbody>
                        {render_graph_body()}
                        {/* {sizes && sizes.length &&
                            sizes.map((s) => {
                                return (
                                    <tr key={s.label}>
                                        <th>{s.label}</th>
                                        <th><TextField
                                            value={s.neck}
                                            type={"number"}
                                            onChange={(val)=>handlesizeChange(s,'neck',val)}
                                            autoComplete={s.value+"_neck"}                                    />
                                        </th>
                                        <th><TextField
                                            value={s.chest}
                                            onChange={(val)=>handlesizeChange(s,'chest',val)}
                                            type="number"
                                            autoComplete={s.value+"_chest"}
                                        /></th>
                                        <th><TextField
                                            value={s.length}
                                            onChange={(val)=>handlesizeChange(s,'length',val)}
                                            type="number"
                                            autoComplete={s.value+"_length"}
                                        /></th>
                                        <th><TextField
                                            value={s.waist}
                                            onChange={(val)=>handlesizeChange(s,'waist',val)}
                                            type="number"
                                            autoComplete={s.value+"_waist"}
                                        /></th>
                                        <th><TextField
                                            value={s.hips}
                                            onChange={(val)=>handlesizeChange(s,'hips',val)}
                                            type="number"
                                            autoComplete={s.value+"_hips"}
                                        /></th>
                                        <th><TextField
                                            value={s.pant}
                                            onChange={(val)=>handlesizeChange(s,'pant',val)}
                                            type="number"
                                            autoComplete={s.value+"_pant"}
                                        /></th>
                                    </tr>
                                )
                            })
                        } */}

                    </tbody>
                </table>
                <hr/>
                <HeadingWrapper size="16px" weight={400} style={{ marginBottom: 8 }}>
                    2. Select the product(s) you want this widget to be shown:
                </HeadingWrapper>
                  <Button onClick={() => toggleResourcePicker(true)}>Select product(s)</Button>
                  <br />
                {products.map((product,index) => (
                <ListItem
                    key={index}
                    product={product}
                    onRemove={(productId) => {
                    const index = products.findIndex((item) => item.id == productId);
                    products.splice(index, 1);
                    setProducts([ ...products ]);
                    }}
                />
                ))}
                <Button loading={loading} submit>Submit</Button>
            </FormLayout>
            <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={resourcePicker}
        onCancel={() => toggleResourcePicker(false)}
        onSelection={(products) => {
          toggleResourcePicker(false);
          const mappedProducts = products.selection.map((product) => ({
            id: product.id,
            title: product.title
            // variants: product.variants.map(({ id, title, displayName, selectedOptions }) => ({
            //   id,
            //   title,
            //   displayName,
            //   selectedOptions,
            // })),
          }));
          setProducts(mappedProducts);
        }}
        showDraft={true}
        showDraftBadge={true}
        initialSelectionIds={products.map((product) => ({
          id: product.id,
        //   variants: product.variants.map(({ id }) => ({ id })),
        }))}
      />
        </Form>
    );
}

const style = {
    input: {
        backgroundColor: "red"
    }
}