import { TitleBar,ResourcePicker } from '@shopify/app-bridge-react';
import { Form, FormLayout, Toast, Banner,Checkbox, Frame, TextField, Select, Button, Page, Layout, Card, DataTable } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { Heading as HeadingWrapper,ListItem } from '../components';
export default (props) => {

    const [id,setid] = useState(null);
    const [gender, setgender] = useState('m');
    const [chest, setchest] = useState('');
    const [waist, setwaist] = useState('');
    const [size, setsize] = useState('');
    const [neck, setneck] = useState('');
    const [hips, sethips] = useState('');
    const [pant, setpant] = useState('');
    const [unit, setUnit] = useState("Centimeters");
    const [resourcePicker, toggleResourcePicker] = useState(false);
    const [products,setProducts] = useState([]);
    const options = [
        { label: 'Male', value: 'm' },
        { label: 'Female', value: 'f' }
    ];
    useEffect(()=>{
        if(props.measurement){
            let measurement = props.measurement;
            setProducts(measurement.products);
            setgender(measurement.gender);
            setSizes(measurement.sizes);
            settitle(measurement.title);
            setid(measurement._id);
        }
    },[])
    const [sizes, setSizes] = useState([
        { label: 'XS', value: 'xs', neck: '', chest: '', waist: '', hips: '', arms: '', shirt_length: '', pant: '' },
        { label: 'S', value: 's', neck: '', chest: '', waist: '', hips: '', arms: '', shirt_length: '', pant: '' },
        { label: 'M', value: 'm', neck: '', chest: '', waist: '', hips: '', arms: '', shirt_length: '', pant: '' },
        { label: 'L', value: 'l', neck: '', chest: '', waist: '', hips: '', arms: '', shirt_length: '', pant: '' },
        { label: 'XL', value: 'xl', neck: '', chest: '', waist: '', hips: '', arms: '', shirt_length: '', pant: '' },
        { label: '2XL', value: '2xl', neck: '', chest: '', waist: '', hips: '', arms: '', shirt_length: '', pant: '' },
        { label: '3XL', value: '3xl', neck: '', chest: '', waist: '', hips: '', arms: '', shirt_length: '', pant: '' },

    ]);
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
            if(a.label == s.label)
            {
                sizes_[i][key] = value;
            }
        })
        setSizes(sizes_);
        console.log(sizes);
        // console.log(s,sizes_,key,valu    e);
    }
    , []);
    const handletitleChange = useCallback((value) => settitle(value), []);
    const handlesubmit = () => {
        setLoading(true);
        props.handlesubmit({id, gender, size, chest, waist, hips, neck, pant, unit,sizes,title,products }, () => {
            setneck('');
            setchest('');
            setwaist('');
            setsize('');
            setpant('');
            sethips('');
            setLoading(false);
        });
    }
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
                    label="Gender"
                    options={options}
                    onChange={handlegenderChange}
                    value={gender}
                />
                <table border="1">
                    <thead>
                        <tr>
                            <th>Size</th>
                            <th>Neck</th>
                            <th>Chest</th>
                            <th>Shirt Length</th>
                            <th>Waist</th>
                            <th>Hips</th>
                            <th>Pant Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sizes && sizes.length &&
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
                        }

                    </tbody>
                </table>
                <HeadingWrapper size="16px" weight={400} style={{ marginBottom: 8 }}>
                    2. Select the product(s) you want this widget to be shown:
                </HeadingWrapper>
                  <Button onClick={() => toggleResourcePicker(true)}>Select product(s)</Button>
                  <br />
                {console.log("dddd",products)}
                {products.map((product) => (
                <ListItem
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
        open={resourcePicker}
        onCancel={() => toggleResourcePicker(false)}
        onSelection={(products) => {
          toggleResourcePicker(false);
          const mappedProducts = products.selection.map((product) => ({
            id: product.id,
            title: product.title,
            variants: product.variants.map(({ id, title, displayName, selectedOptions }) => ({
              id,
              title,
              displayName,
              selectedOptions,
            })),
          }));
          setProducts(mappedProducts);
        }}
        showDraft={true}
        showDraftBadge={true}
        initialSelectionIds={products.map((product) => ({
          id: product.id,
          variants: product.variants.map(({ id }) => ({ id })),
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