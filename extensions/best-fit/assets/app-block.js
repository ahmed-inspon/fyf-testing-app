    // let h2 = document.createElement("h2");
    // h2.innerHTML = "hello store"
    // let product_container = document.getElementsByClassName('product__info-container')[0];
    // product_container.append(h2);

    document.querySelector('.fyf-extension [data-toggle=modal]').addEventListener('click',function(){
        document.querySelector('.fyf-extension #fyf-modal').classList.toggle('show');
    })

    document.querySelectorAll('.fyf-extension [data-dismiss=modal]').forEach((el)=>{
        el.addEventListener('click',function(){
            document.querySelector('.fyf-extension #fyf-modal').classList.toggle('show');
        })
    })
    document.querySelector('.fyf-extension .step-1').addEventListener('click',()=>{
        document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-2').style.display = "block";
    });
    document.querySelector('.fyf-extension .step-1').addEventListener('click',()=>{
        document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-2').style.display = "block";
    });
    document.querySelector('.fyf-extension #step-2').addEventListener('click',()=>{
        document.querySelector('.fyf-extension #cart-page-1').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-3').style.display = "block";
        document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
    });

    document.querySelector('.fyf-extension .step-3').addEventListener('click',()=>{
        document.querySelector('.fyf-extension #cart-page-1').style.display = "block";
        document.querySelector('.fyf-extension #cart-page-3').style.display = "none";
        document.querySelector('.fyf-extension #cart-page-2').style.display = "none";
    });