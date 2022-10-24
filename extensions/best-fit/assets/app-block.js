    // let h2 = document.createElement("h2");
    // h2.innerHTML = "hello store"
    // let product_container = document.getElementsByClassName('product__info-container')[0];
    // product_container.append(h2);
    const base_url = "https://1feb-182-189-239-66.eu.ngrok.io/";
    const store_name = document.querySelector(".fyf-extension").getAttribute("data-store-name");
    let gender_setup = "";
    let measurements = [];
    let best_fit = localStorage.getItem("fyf-best-fit");
    let unit_input = document.querySelector(".fyf-extension input[type='radio'][name='unit']:checked");
    let chest_input = document.querySelector(".fyf-extension input[name='chest']");
    let waist_input = document.querySelector(".fyf-extension input[name='waist']");
    let hips_input = document.querySelector(".fyf-extension input[name='hips']");
    let neck_input = document.querySelector(".fyf-extension input[name='neck']");
    let pant_input = document.querySelector(".fyf-extension input[name='pant']");


    console.log("unit",unit_input.value);


    const init = async ()=>{
        if(best_fit){
            document.querySelector(".fyf-extension #best-fit-div").style.display = "block";
            document.querySelectorAll(".fyf-extension .best-fit-recommended").forEach(el=>{
                el.innerText = best_fit;
            });
            document.querySelector('.fyf-extension #cart-page-3').style.display = "block";
            document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
            document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
        }
        let resp = await fetch(base_url+"api/app_extension?shop="+store_name,{
            headers:{
                "ngrok-skip-browser-warning":true
            }
        });
        if(resp.ok){
            resp = await resp.json();
            if(resp.success){
                measurements = resp.data.measurements;
            }
            if(resp.data.store_settings){
                let {bgColors,unit,fontColors} = resp.data.store_settings;
                document.querySelectorAll('.fyf-extension .bgColor').forEach((el)=>{
                    el.style.backgroundColor = bgColors;
                })
                document.querySelectorAll('.fyf-extension .fontColor').forEach((el)=>{
                    el.style.color = fontColors;
                    console.log("el",el,fontColors);
                })
            }
        }
        
    }
    // https://54f7-182-189-253-118.eu.ngrok.io?shop=fyf-testing.myshopify.com&host=ZnlmLXRlc3RpbmcubXlzaG9waWZ5LmNvbS9hZG1pbg
    document.querySelector('.fyf-extension [data-toggle=modal]').addEventListener('click',function(){
        document.querySelector('.fyf-extension #fyf-modal').classList.toggle('show');
    })

    document.querySelectorAll('.fyf-extension [data-dismiss=modal]').forEach((el)=>{
        el.addEventListener('click',function(){
            document.querySelector('.fyf-extension #fyf-modal').classList.toggle('show');
        })
    })
    document.querySelectorAll('.fyf-extension .step-1').forEach(el=>{
        el.addEventListener('click',(e)=>{
            let gender = e.target.getAttribute('data-gender');
            if(gender){
                gender_setup = gender;
                document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
                document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
                document.querySelector('.fyf-extension #cart-page-2').style.display = "block";
            }
        });
    })
    
    document.querySelector('.fyf-extension #step-2').addEventListener('click',async ()=>{
        let chest = chest_input.value;
        if(chest <= 0 || isNaN(chest)){
            alert("wrong chest");
        }
        if(measurements && measurements.length){
           let measurements_ =  measurements.filter((m)=>{ return m.gender == gender_setup});
           console.log("measuremen",measurements_,gender_setup);
           if(measurements_ && measurements_.length){
            chest_m = measurements_.sort((a,b)=>{
                return a.chest - b.chest
            });
            let chest_size = "";
            chest_m.forEach((c)=>{
                if(c.chest >= chest && chest_size == ""){
                    chest_size = c.size;
                }
            })
            console.log("chest_sizr",chest_size);
            }
        }
        // document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
        // document.querySelector('.fyf-extension #cart-page-3').style.display = "block";
        // document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
   
    });

    document.querySelector('.fyf-extension .step-3').addEventListener('click',()=>{
        document.querySelector('.fyf-extension #cart-page-1').style.display = "block";
        document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
    });

    init();