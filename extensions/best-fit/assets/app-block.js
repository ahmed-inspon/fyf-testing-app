// let h2 = document.createElement("h2");
// h2.innerHTML = "hello store"
// let product_container = document.getElementsByClassName('product__info-container')[0];
// product_container.append(h2);
if (!window.fyf_app_extension) {
  const base_url = "https://fyf-shopify-app.sellquicky.com/";
//   const base_url = "https://2a11-182-189-251-235.ap.ngrok.io/";
  let store_name = null;
  let product_id = null;
  let sizes_order = ["3XL", "2XL", "XL", "L", "M", "S", "XS"];
  if (document.querySelector(".fyf-extension")) {
    store_name = document
      .querySelector(".fyf-extension")
      .getAttribute("data-store-name");
    product_id = document
      .querySelector(".fyf-extension")
      .getAttribute("data-product-id");
  }
  let modal = document.querySelector(".fyf-extension #fyf-modal");
  let modal_page1 = document.querySelector(".fyf-extension #cart-page-1");
  let modal_page2 = document.querySelector(".fyf-extension #cart-page-2");
  let modal_page3 = document.querySelector(".fyf-extension #cart-page-3");

  let gender_setup = "";
  let measurements = [];
  let unit_input = null;
  let neck_input = document.querySelector(".fyf-extension input[name='neck']");
  let chest_input = document.querySelector(
    ".fyf-extension input[name='chest']"
  );
  let sleeves_input = document.querySelector(
    ".fyf-extension input[name='sleeves']"
  );
  let shirt_length_input = document.querySelector(
    ".fyf-extension input[name='shirt_length']"
  );
  let waist_input = document.querySelector(
    ".fyf-extension input[name='waist']"
  );
  let hips_input = document.querySelector(".fyf-extension input[name='hips']");
  let pant_input = document.querySelector(".fyf-extension input[name='pant']");
  const types = [
    {
      label: "General Clothing",
      value: "ge_ap",
      graphs: "neck,chest,shirt_length,sleeves,waist,hips,pant",
    },
    {
      label: "Women`s Shirts Without Sleeves",
      value: "wo_sh",
      graphs: "neck,chest,shirt_length",
    },
    {
      label: "Women`s Shirts With Sleeves",
      value: "wo_sh_sl",
      graphs: "neck,chest,shirt_length,sleeves",
    },
    {
      label: "Men`s Shirts Without Sleeves",
      value: "me_sh",
      graphs: "neck,chest,shirt_length",
    },
    {
      label: "Men`s Shirts With Sleeves",
      value: "me_sh_sl",
      graphs: "neck,chest,shirt_length,sleeves",
    },
    { label: "Women`s Pants", value: "wo_pa", graphs: "waist,hips,pant" },
    { label: "Men`s Pants", value: "me_pa", graphs: "waist,pant" },
    { label: "Men`s Shorts", value: "me_sho", graphs: "waist" },
  ];
  // console.log("unit",product_id,unit_input.value);

  const init = async () => {
    if (modal_page1) {
      modal_page1.style.display =
        "block";
      modal_page2.style.display =
        "none";
      modal_page3.style.display =
        "none";
    }

    let resp = await fetch(base_url + "api/app_extension?shop=" + store_name, {
      headers: {
        "ngrok-skip-browser-warning": true,
      },
    });
    measurements = null;
    if (resp.ok) {
      resp = await resp.json();
      if (resp.success) {
        if (resp.data?.measurements && resp.data?.measurements?.length) {
          resp.data.measurements.forEach((m) => {
            if (m.products && m.products.length) {
              m.products.forEach((p) => {
                if (p.id.indexOf(product_id) != -1) {
                  measurements = m;
                }
              });
            }
          });
        }
        console.log("measuremnet", measurements);
        if (measurements) {
          let best_fit = localStorage.getItem(
            "fyf-best-fit-" + measurements._id
          );
          if (best_fit) {
            render_suggested_size(best_fit);
          }
          let type_ = measurements.type;
          let graph_ = types.filter((t) => {
            return t.value == type_;
          });
          let graphs = [
            "neck",
            "chest",
            "sleeves",
            "shirt_length",
            "waist",
            "hips",
            "pant",
          ];
          if (graph_ && graph_.length) {
            graphs = graph_[0].graphs.split(",");
          }
          graphs.forEach((g) => {
            console.log("g", g);
            document.querySelector(`.${g}-input-group`).style.display = "block";
          });
          console.log("grph", graph_);
          document.querySelector(".fyf-extension").style.display = "block";
          let table_body = "";
          let table_head = "<tr><th>Size</th>";
          if (graphs.includes("neck")) {
            table_head += `<th>Neck</th>`;
          }
          if (graphs.includes("chest")) {
            table_head += `<th>Chest</th>`;
          }
          if (graphs.includes("sleeves")) {
            table_head += `<th>Sleeves</th>`;
          }
          if (graphs.includes("shirt_length")) {
            table_head += `<th>Shirt Length</th>`;
          }
          if (graphs.includes("waist")) {
            table_head += `<th>Waist</th>`;
          }
          if (graphs.includes("hips")) {
            table_head += `<th>Hips</th>`;
          }
          if (graphs.includes("pant")) {
            table_head += `<th>Pant</th>`;
          }
          table_head += "</tr>";

          measurements.sizes.forEach((s) => {
            table_body += `<tr><td data-th="Size"><strong>${s.label}</strong></td>`;
            if (graphs.includes("neck")) {
              table_body += `<td data-th="Neck">${s.neck}</td>`;
            }
            if (graphs.includes("chest")) {
              table_body += `<td data-th="Chest">${s.chest}</td>`;
            }
            if (graphs.includes("sleeves")) {
              table_body += `<td data-th="Sleeves">${s.sleeves}</td>`;
            }
            if (graphs.includes("shirt_length")) {
              table_body += `<td data-th="Shirt Length">${s.shirt_length}</td>`;
            }
            if (graphs.includes("waist")) {
              table_body += `<td data-th="Waist">${s.waist}</td>`;
            }
            if (graphs.includes("hips")) {
              table_body += `<td data-th="Hips">${s.hips}</td>`;
            }
            if (graphs.includes("pant")) {
              table_body += `<td data-th="Pant">${s.pant}</td>`;
            }

            table_body += `</tr>`;
          });

          document
            .querySelectorAll(".fyf-modal-snippet .chart-head")
            .forEach((el) => {
              el.innerHTML = table_head;
            });
          document
            .querySelectorAll(".fyf-modal-snippet .chart-body")
            .forEach((el) => {
              el.innerHTML = table_body;
            });
        }
        // measurements = resp.data.measurements[0];
      }
      if (resp.data.store_settings) {
        let { appearance, unit } = resp.data.store_settings;
        document.querySelectorAll(".fyf-extension .unit").forEach((el) => {
          el.innerHTML = unit;
        });
        document.querySelector(
          ".fyf-extension .fyf-recommend-title"
        ).innerText = appearance.recommend_title;
        document.querySelector(".fyf-extension .fyf-btn-title").innerText =
          appearance.btn_title;
        document.querySelector(".fyf-extension .fyf-modal-title").innerText =
          appearance.modal_title;
        document.querySelector(".fyf-extension .fyf-modal-desc").innerText =
          appearance.modal_desc;
        document.querySelector(".fyf-extension .fyf-modal-desc2").innerText =
          appearance.modal_desc2;
        document.querySelector(".fyf-extension .fyf-next-btn-title").innerText =
          appearance.next_btn_title;
        document.querySelector(
          ".fyf-extension .fyf-our-recommendation-title"
        ).innerText = appearance.our_recommendation_title;
        document.querySelector(
          ".fyf-extension .fyf-our-recommendation-desc"
        ).innerText = appearance.our_recommendation_desc;
        document.querySelector(
          ".fyf-extension .fyf-start-btn-title"
        ).innerText = appearance.start_btn_title;
        document.querySelector(
          ".fyf-extension .fyf-close-btn-title"
        ).innerText = appearance.close_btn_title;
        document.querySelectorAll(".fyf-extension .bgColor").forEach((el) => {
          el.style.backgroundColor = appearance.bg_color;
        });
        document.querySelectorAll(".fyf-extension .fontColor").forEach((el) => {
          el.style.color = appearance.font_color;
        });
        document.querySelectorAll(".fyf-extension button").forEach((el) => {
          el.style.backgroundColor = appearance.btn_bg_color;
          el.style.borderColor = appearance.btn_border_color;
        });
        document.querySelectorAll(".fyf-extension input").forEach((el) => {
          el.style.borderColor = appearance.btn_border_color;
        });
      }
    }
    document.querySelectorAll('.fyf-form-control').forEach((el)=>{
      el.addEventListener('keydown',(e)=>{
          // Allow: backspace, delete, tab, escape, enter, ctrl+A and .
        if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
          (e.keyCode == 65 && e.ctrlKey === true) || 
          (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
        }
        var charValue = String.fromCharCode(e.keyCode)
          , valid = /^[0-9]+$/.test(charValue);

        if (!valid) {
          e.preventDefault();
        }
      })
    });
  };
  // https://54f7-182-189-253-118.eu.ngrok.io?shop=fyf-testing.myshopify.com&host=ZnlmLXRlc3RpbmcubXlzaG9waWZ5LmNvbS9hZG1pbg
 
  document
    .querySelectorAll(".fyf-extension [data-dismiss=modal]")
    ?.forEach((el) => {
      el.addEventListener("click", function () {
        document
          .querySelector(".fyf-extension #fyf-modal")
          .classList.toggle("show");
      });
    });
  document
    .querySelector(".fyf-extension #step-1")
    ?.addEventListener("click", (e) => {
      // let gender = e.target.getAttribute('data-gender');
      // if(gender){
      //     gender_setup = gender;
      modal_page1.style.display =
        "none";
      modal_page3.style.display =
        "none";
      modal_page2.style.display =
        "block";
      // }
    });

  document
    .querySelector(".fyf-extension #step-1-back")
    ?.addEventListener("click", (e) => {
      show_input_modal();
    });

  document
    .querySelector(".fyf-extension #step-2")
    ?.addEventListener("click", async () => {

      hide_form_error();
      //processing inputs
      let inputs = fetch_inputs();
      let graphs = filter_graph();
      //validation
      if(!validation_check(inputs,graphs)){
        return;
      }
      // suggested sizes
      let suggested_sizes = filter_suggested_sizes(inputs,graphs);
      // finding single most appropriate size
      if(suggested_sizes.length){
        let suggested_size = mode(suggested_sizes);
        if (suggested_size) {
          localStorage.setItem("fyf-best-fit-" + measurements._id, suggested_size);
          render_suggested_size(suggested_size);
          show_result_modal();
          clear_form_inputs();
          return;
        }
      }
      else{
        show_form_error("Oops! this size is not available.");
      }
    });

  document
    .querySelector(".fyf-extension .step-3")
    ?.addEventListener("click", () => {
      start_again();
    });
  if (document.querySelector(".fyf-app-embed")) {
    // alert("added");
    let target_node = document.querySelector("variant-radios");
    if (!target_node) {
      target_node = document.querySelector("variant-selects");
    }
    if(target_node){
      let embed_block = document.querySelector(".fyf-app-embed");
      target_node?.parentNode?.insertBefore(embed_block, target_node.nextSibling);
    }
  }
  const mode = (arr) => {
    let sizes_count = {};
    let max_count = 0;
    for (var i = 0; i < arr.length; i++) {
      var el = arr[i];
      if (sizes_count[el] == null) sizes_count[el] = 1;
      else sizes_count[el]++;
    }
    let sortable = [];
    for (var el in sizes_count) {
      sortable.push([el, sizes_count[el]]);
    }
    let sortable_size = sortable.sort((a, b) => {
      return b[1] - a[1];
    });
    max_count = sortable_size[0][1];
    console.log("arr", arr);
    if (arr.length == 3) {
      // three graph measurement

      if (max_count >= 2) {
        return sortable_size[0][0];
      } else {
        for (let i = 0; i < sizes_order.length; i++) {
          if (arr.includes(sizes_order[i])) {
            return sizes_order[i];
          }
        }
      }
    }
    if (arr.length == 4) {
      console.log("sortable size", sortable_size);
      if (max_count >= 3) {
        // two suggested sizes with 1 mode [S,M,M,M] || [M,M,M,M]
        return sortable_size[0][0];
      } else if (max_count == 2) {
        // [S,M,L,L] || [S,S,M,M]
        if (sortable_size.length == 2) {
          // two suggested sizes with 2 modes [S,S,M,M]
          for (let i = 0; i < sizes_order.length; i++) {
            // selecting high size among 2 modes
            if (arr.includes(sizes_order[i])) {
              return sizes_order[i];
            }
          }
        } else {
          // [S,M,M,L]
          return sortable_size[0][0];
        }
      } else {
        // [S,M,L,XL]
        let sorted_sizes = [];
        for (let i = 0; i < sizes_order.length; i++) {
          // selecting high size among 2 modes
          if (arr.includes(sizes_order[i])) {
            sorted_sizes.push(sizes_order[i]);
          }
        }
        //selecting second highest size to accomodate all four sizes
        return sorted_sizes[1];
      }
    }
    return sortable_size[0][0];
  };

  const render_suggested_size = (size) => {
    document.querySelector(".fyf-extension #best-fit-div").style.display =
      "block";
    document
      .querySelectorAll(".fyf-extension .best-fit-recommended")
      .forEach((el) => {
        el.innerText = size;
      });
    show_result_modal();
  };

  const show_input_modal = () => {
    modal_page1.style.display =
      "block";
    modal_page3.style.display =
      "none";
    modal_page2.style.display =
      "none";
  };

  const show_result_modal = () => {
    modal_page1.style.display =
      "none";
    modal_page3.style.display =
      "block";
    modal_page2.style.display =
      "none";
  };
  const unit_conversion = (num, from, to) => {
    let Infactor = 2.54;
    let Cmfactor = 1 / 2.54;
    console.log("num", num, from, to);
    from = from.toLowerCase();
    to = to.toLowerCase();
    let converted = num;
    if (from == "inches" || from == "inch" || from == "in") {
      if (to == "cm" || to == "centimeters" || to == "centimeter") {
        converted = Math.round(num * Infactor);
      }
    } else if (from == "cm" || to == "centimeters" || to == "centimeter") {
      if (to == "inches" || to == "inch" || to == "in") {
        converted = Math.round(num * Cmfactor);
      }
    }
    console.log("num", num, converted, from, to);
    return converted;
  };
  document.querySelector("body").addEventListener("click", (e) => {
    console.log("e.target", e.target, e.target.id);
    if (
      e.target?.id == "fyf-modal" &&
      modal.classList.contains("show")
    ) {
      modal.classList.toggle("show");
    }
  });
  if(top?.window?.location && top?.window?.location?.href?.includes("admin/themes"))
  {
    document.querySelector(".fyf-extension").style.display = "block";
    console.log("theme editor opened!",document.querySelector(".fyf-extension"));
  }
  else{
    // initialization;
    if (document.URL.includes("products") && window.location.pathname.split("/").includes("products")){
      init();
    }
    document
    .querySelector(".fyf-extension [data-toggle=modal]")
    ?.addEventListener("click", function () {
      modal.classList.toggle("show");
    });

  }
  // helper functions
  const fetch_inputs = () => {
    let unit = document.querySelector(
      ".fyf-extension input[type='radio'][name='unit']:checked"
    ).value;
    let measurement_unit = measurements.unit;

    let inputs = {};
      inputs.unit = unit;
      inputs.neck = unit_conversion(neck_input.value, unit, measurement_unit);
      inputs.chest = unit_conversion(chest_input.value, unit, measurement_unit);
      inputs.sleeves = unit_conversion(sleeves_input.value,unit, measurement_unit);
      inputs.shirt_length = unit_conversion(shirt_length_input.value,unit,measurement_unit);
      inputs.waist = unit_conversion(waist_input.value, unit, measurement_unit);
      inputs.hips = unit_conversion(hips_input.value, unit, measurement_unit);
      inputs.pant = unit_conversion(pant_input.value, unit, measurement_unit);
      return inputs;
  }

  const clear_form_inputs = () => {
    neck_input.value = "";
    chest_input.value = "";
    sleeves_input.value = "";
    shirt_length_input.value = "";
    waist_input.value = "";
    hips_input.value = "";
    pant_input.value = "";

  }

  const validation_check = (inputs,graphs) =>{
    let success = true;
    let keys = Object.keys(inputs);
    for(let i=0;i < keys.length ; i++){
      let k = keys[i];
      if (graphs.includes(k)) {
        console.log("inputs[k]",inputs[k]);
        if (inputs[k] <= 0 || isNaN(inputs[k])) {
          show_form_error("Please enter valid "+k+" size")
          return false;
        }
        if(inputs[k] >= 200 || inputs[k] <= 5)
        {
          show_form_error("Please enter realistic "+k+" size")
          return false;
        }
      }
    }
    return success;
  }

  const filter_graph = ()=>{
    let type_ = measurements.type;
    let graph_ = types.filter((t) => {
      return t.value == type_;
    });
    let graphs = [
      "neck",
      "chest",
      "sleeves",
      "shirt_length",
      "waist",
      "hips",
      "pant",
    ];
    if (graph_ && graph_.length) {
      graphs = graph_[0].graphs.split(",");
    }
    return graphs;
  }
  const filter_suggested_sizes = (inputs,graphs) =>{
    let suggested_sizes = [];
    graphs.forEach((g) => {
      let sizes = measurements.sizes;
      for (let i = 0; i < sizes.length; i++) {
        if (inputs[g] <= sizes[i][g]) {
          suggested_sizes.push(sizes[i].label);
          break;
        }
      }
    });
    return suggested_sizes;
  }
  const show_form_error = (msg)=>{
    if(document.querySelector(".fyf-extension .error-box")){
      document.querySelector(".fyf-extension .error-box").style.display = "block";
      document.querySelector(".fyf-extension .error-box").innerHTML = "⚠️"+msg
    }
  }

  const hide_form_error = () =>{
    if(document.querySelector(".fyf-extension .error-box")){
    document.querySelector(".fyf-extension .error-box").style.display = "none";
    document.querySelector(".fyf-extension .error-box").innerHTML = "";
    }
  }

  const start_again = () =>{
    modal_page1.style.display =
    "none";
  modal_page3.style.display =
    "none";
  modal_page2.style.display =
    "block";
  }
}

window.fyf_app_extension = true;
