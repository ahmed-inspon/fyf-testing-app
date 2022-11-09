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
    if (document.querySelector(".fyf-extension #cart-page-1")) {
      document.querySelector(".fyf-extension #cart-page-1").style.display =
        "block";
      document.querySelector(".fyf-extension #cart-page-2").style.display =
        "none";
      document.querySelector(".fyf-extension #cart-page-3").style.display =
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
            table_body += `<tr><th>${s.label}</th>`;
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
  };
  // https://54f7-182-189-253-118.eu.ngrok.io?shop=fyf-testing.myshopify.com&host=ZnlmLXRlc3RpbmcubXlzaG9waWZ5LmNvbS9hZG1pbg
  document
    .querySelector(".fyf-extension [data-toggle=modal]")
    ?.addEventListener("click", function () {
      document
        .querySelector(".fyf-extension #fyf-modal")
        .classList.toggle("show");
    });

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
      document.querySelector(".fyf-extension #cart-page-1").style.display =
        "none";
      document.querySelector(".fyf-extension #cart-page-3").style.display =
        "none";
      document.querySelector(".fyf-extension #cart-page-2").style.display =
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
      let unit = document.querySelector(
        ".fyf-extension input[type='radio'][name='unit']:checked"
      ).value;
      let measurement_unit = measurements.unit;
      let neck = unit_conversion(neck_input.value, unit, measurement_unit);
      let chest = unit_conversion(chest_input.value, unit, measurement_unit);
      let sleeves = unit_conversion(
        sleeves_input.value,
        unit,
        measurement_unit
      );
      let shirt_length = unit_conversion(
        shirt_length_input.value,
        unit,
        measurement_unit
      );
      let waist = unit_conversion(waist_input.value, unit, measurement_unit);
      let hips = unit_conversion(hips_input.value, unit, measurement_unit);
      let pant = unit_conversion(pant_input.value, unit, measurement_unit);
      console.log("neck", unit, neck_input.value, measurement_unit, neck);
      console.log("unit", unit, measurement_unit);
      let inputs = [];
      inputs.neck = neck;
      inputs.chest = chest;
      inputs.sleeves = sleeves;
      inputs.shirt_length = shirt_length;
      inputs.waist = waist;
      inputs.hips = hips;
      inputs.pant = pant;

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
      console.log("graphs", type_, measurements, graphs, graph_);
      if (graphs.includes("neck")) {
        if (neck <= 0 || isNaN(neck)) {
          alert("wrong neck");
        }
      }
      if (graphs.includes("chest")) {
        if (chest <= 0 || isNaN(chest)) {
          alert("wrong chest");
        }
      }
      if (graphs.includes("sleeves")) {
        if (sleeves <= 0 || isNaN(sleeves)) {
          alert("wrong sleeves");
        }
      }
      if (graphs.includes("shirt_length")) {
        if (shirt_length <= 0 || isNaN(shirt_length)) {
          alert("wrong shirt_length");
        }
      }
      if (graphs.includes("waist")) {
        if (waist <= 0 || isNaN(waist)) {
          alert("wrong waist");
        }
      }
      if (graphs.includes("hips")) {
        if (hips <= 0 || isNaN(hips)) {
          alert("wrong hips");
        }
      }
      if (graphs.includes("pant")) {
        if (pant <= 0 || isNaN(pant)) {
          alert("wrong pant");
        }
      }
      let suggested_sizes = [];
      graphs.forEach((g) => {
        let sizes = measurements.sizes;
        for (let i = 0; i < sizes.length; i++) {
          console.log("ssss", inputs[g], sizes[i][g], sizes[i].label);
          if (inputs[g] <= sizes[i][g]) {
            suggested_sizes.push(sizes[i].label);
            break;
          }
        }

        // sizes.forEach((s)=>{
        //     console.log(inputs[g] , s[g]);
        //     if(inputs[g] <= s[g])
        //     {
        //         suggested_size.push(s.label);
        //     }
        // });

        // measurements.sizes.forEach((s)=>{

        // });
      });
      let mode_ = mode(suggested_sizes);
      let suggested_size = mode_;
      console.log("suggested", suggested_size);
      if (suggested_size) {
        localStorage.setItem("fyf-best-fit-" + measurements._id, suggested_size);
        render_suggested_size(suggested_size);
        show_result_modal();
      }
      console.log("mode", mode_);
      console.log("ggggg", suggested_size, graphs, measurements);
      return;
      //old code
      // if(measurements && measurements.length){
      //    let measurements_ =  measurements.filter((m)=>{ return m.gender == gender_setup});
      //    console.log("measuremen",measurements_,gender_setup);
      //    if(measurements_ && measurements_.length){
      //     chest_m = measurements_.sort((a,b)=>{
      //         return a.chest - b.chest
      //     });
      //     let chest_size = "";
      //     chest_m.forEach((c)=>{
      //         if(c.chest >= chest && chest_size == ""){
      //             chest_size = c.size;
      //         }
      //     })
      //     console.log("chest_sizr",chest_size);
      //     }
      // }
      document.querySelector(".fyf-extension #cart-page-1").style.display =
        "none";
      document.querySelector(".fyf-extension #cart-page-3").style.display =
        "block";
      document.querySelector(".fyf-extension #cart-page-2").style.display =
        "none";
    });

  document
    .querySelector(".fyf-extension .step-3")
    ?.addEventListener("click", () => {
      document.querySelector(".fyf-extension #cart-page-1").style.display =
        "block";
      document.querySelector(".fyf-extension #cart-page-3").style.display =
        "none";
      document.querySelector(".fyf-extension #cart-page-2").style.display =
        "none";
    });
  if (document.querySelector(".fyf-app-embed")) {
    // alert("added");
    let target_node = document.querySelector("variant-radios");
    if (!target_node) {
      target_node = document.querySelector("variant-selects");
    }
    let embed_block = document.querySelector(".fyf-app-embed");
    target_node.parentNode.insertBefore(embed_block, target_node.nextSibling);

    console.log("rendering", target_node, embed_block);
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
    document.querySelector(".fyf-extension #cart-page-1").style.display =
      "block";
    document.querySelector(".fyf-extension #cart-page-3").style.display =
      "none";
    document.querySelector(".fyf-extension #cart-page-2").style.display =
      "none";
  };

  const show_result_modal = () => {
    document.querySelector(".fyf-extension #cart-page-1").style.display =
      "none";
    document.querySelector(".fyf-extension #cart-page-3").style.display =
      "block";
    document.querySelector(".fyf-extension #cart-page-2").style.display =
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
      document
        .querySelector(".fyf-extension #fyf-modal")
        .classList.contains("show")
    ) {
      document
        .querySelector(".fyf-extension #fyf-modal")
        .classList.toggle("show");
    }
  });
  // initialization;
  if (document.URL.includes("products") && window.location.pathname.split("/").includes("products")){
    init();
  }
  
}

window.fyf_app_extension = true;
