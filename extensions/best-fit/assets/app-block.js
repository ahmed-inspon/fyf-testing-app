    // let h2 = document.createElement("h2");
    // h2.innerHTML = "hello store"
    // let product_container = document.getElementsByClassName('product__info-container')[0];
    // product_container.append(h2);

    if(!window.fyf_app_extension){
        const base_url = "https://fyf-shopify-app.sellquicky.com/";
        // const base_url = "https://3131-182-189-234-80.eu.ngrok.io/";
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
            document.querySelector('.fyf-extension #cart-page-1').style.display = "block";
            document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
            document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
        if(best_fit){
            document.querySelector(".fyf-extension #best-fit-div").style.display = "block";
            document.querySelectorAll(".fyf-extension .best-fit-recommended").forEach(el=>{
                el.innerText = best_fit;
            });
        }
        let resp = await fetch(base_url+"api/app_extension?shop="+store_name,{
            headers:{
                "ngrok-skip-browser-warning":true
            }
        });
        let measurements = null;
        if(resp.ok){
            resp = await resp.json();
            if(resp.success){
                measurements = resp.data.measurements[0];
            }
            if(resp.data.store_settings){
                let {appearance,unit} = resp.data.store_settings;
                document.querySelector(".fyf-extension .fyf-recommend-title").innerText = appearance.recommend_title;
                document.querySelector(".fyf-extension .fyf-btn-title").innerText = appearance.btn_title;
                document.querySelector(".fyf-extension .fyf-modal-title").innerText = appearance.modal_title;
                document.querySelector(".fyf-extension .fyf-modal-desc").innerText = appearance.modal_desc;
                document.querySelector(".fyf-extension .fyf-modal-desc2").innerText = appearance.modal_desc2;
                document.querySelector(".fyf-extension .fyf-next-btn-title").innerText = appearance.next_btn_title;
                document.querySelector(".fyf-extension .fyf-our-recommendation-title").innerText = appearance.our_recommendation_title;
                document.querySelector(".fyf-extension .fyf-our-recommendation-desc").innerText = appearance.our_recommendation_desc;
                document.querySelector(".fyf-extension .fyf-start-btn-title").innerText = appearance.start_btn_title;
                document.querySelector(".fyf-extension .fyf-close-btn-title").innerText = appearance.close_btn_title;
                document.querySelectorAll('.fyf-extension .bgColor').forEach((el)=>{
                    el.style.backgroundColor = appearance.bg_color;
                })
                document.querySelectorAll('.fyf-extension .fontColor').forEach((el)=>{
                    el.style.color = appearance.font_color;
                })
                document.querySelectorAll('.fyf-extension button').forEach((el)=>{
                    el.style.backgroundColor = appearance.btn_bg_color;
                    el.style.borderColor = appearance.btn_border_color;
                })
                document.querySelectorAll('.fyf-extension input').forEach((el)=>{
                    el.style.borderColor = appearance.btn_border_color;
                })
                let table_body = "";
                measurements.sizes.forEach((s)=>{
                    table_body += `<tr>
                    <td>${s.label}</td>
                    <td>${s.neck}</td>
                    <td>${s.chest}</td>
                    <td>${s.length}</td>
                    <td>${s.waist}</td>
                    <td>${s.hips}</td>
                    <td>${s.pant}</td>
                    </tr>`
                })

                document.querySelector(".fyf-modal-snippet .chart-body").innerHTML = table_body;
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
    document.querySelector('.fyf-extension #step-1').addEventListener('click',(e)=>{
            // let gender = e.target.getAttribute('data-gender');
            // if(gender){
            //     gender_setup = gender;
                document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
                document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
                document.querySelector('.fyf-extension #cart-page-2').style.display = "block";
            // }
    });

    document.querySelector('.fyf-extension #step-1-back').addEventListener('click',(e)=>{
       
            document.querySelector('.fyf-extension #cart-page-1').style.display = "block";
            document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
            document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
    });
    
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
        document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-3').style.display = "block";
        document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
   
    });

    document.querySelector('.fyf-extension .step-3').addEventListener('click',()=>{
        document.querySelector('.fyf-extension #cart-page-1').style.display = "block";
        document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
    });

    init();
    }

    window.fyf_app_extension = true;