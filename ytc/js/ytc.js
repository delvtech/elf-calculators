"use strict";
function calculateRow(speculated_interest=10.5,input_amount=10,
               days_maturity=90,days_matured=0,
               liquidity=50,time_stretch=15,
               target_interest=16) {
    let t = (days_maturity-days_matured) / (365 * time_stretch)
    let T = (days_maturity-days_matured) / 365
    let y_start = liquidity
    let g = .1
    let gas_fee=0.0019
    let accumulated_interest = input_amount * days_matured/365 * speculated_interest/100
    let A = ((input_amount)*(speculated_interest/100)*T-(target_interest/1000)*input_amount*T-gas_fee)/input_amount
    let resulting_pt_apy = A/T*100
    let x_start=y_start/((1-T*(resulting_pt_apy/100))**(-1/t)-1)
    let unit_price = 1-A
    let expenditure=input_amount-unit_price*input_amount+gas_fee+accumulated_interest
    let received = (input_amount * speculated_interest / 100) * (days_maturity) / 365
    let gain = received - expenditure
    let output_amount = (1-A)*input_amount
    let fee = (input_amount - output_amount) * g
    output_amount = output_amount+fee
    let apy = ((received / expenditure) - 1) * 365 / (days_maturity - days_matured) * 100
    //calculate pre-slippage
    let pt_apy = (1- output_amount/input_amount)/T * 100 
    let y_after=liquidity+input_amount
    let x_after=y_after/((1-T*(pt_apy/100))**(-1/t)-1)
    let total_supply = x_after
    let k = (y_after + total_supply)**(1-t) + x_after**(1-t)
    let fj = input_amount 
    let fi = y_after + total_supply - Math.pow(k-Math.pow(x_after + fj,1-t),1/(1-t))

    let y_before=liquidity
    let x_before=x_after+output_amount
    pt_apy = (1-(fj / fi))/T * 100 + (1-1/(Math.pow((y_before+x_before)/x_before,t)))/T

    let row = {Input:input_amount, PT_APY:pt_apy.toFixed(2), Resulting_PT_APY:resulting_pt_apy.toFixed(2), Expenditure: expenditure.toFixed(4), Received:received.toFixed(4), Gain:gain.toFixed(4), APY:apy.toFixed(2) }
    return row
}

function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }

function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (let key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
}

// get elements
const calculate = document.getElementById('calculate');
const input = document.getElementById("input");
const output = document.getElementById("output");
const assetElement = document.getElementById("asset");
const speculatedApyElement = document.getElementById("speculated-apy");
const targetApyElement = document.getElementById("target-apy");
const termLengthElement = document.getElementById("term-length");
const daysMaturedElement = document.getElementById("days-matured");
const liquidityElement = document.getElementById("liquidity");

calculate.addEventListener('click', (event) => {
    let data = []
    let time_stretch = 297.80126 /( 4.32257 * parseFloat(speculatedApyElement.value))
    let start=0
    let end=0
    let increment=0
    let price = 0
    if (assetElement.value == 'ETH'){
        start=10
        end=300
        increment=10
        price = 2500
    }
    else if(assetElement.value == 'BTC'){
        start = .5
        end = 3
        increment = .1
        price = 55000
    }
    else if(assetElement.value == 'USDC'){
        start = 10000
        end = 200000
        increment = 10000
        price=1
    }
    let base_liquidity = (parseFloat(liquidityElement.value)/2)/price
    for(let counter=start;counter<=end;counter+=increment){
        let results = calculateRow(parseFloat(speculatedApyElement.value),
                                counter,
                                parseFloat(termLengthElement.value),
                                parseFloat(daysMaturedElement.value),
                                base_liquidity,
                                time_stretch,
                                parseFloat(targetApyElement.value))
        data.push(results)
    }

    input.style.visibility = "hidden"
    input.style.height = 0
    output.style.visibility = "visible"

    let table = document.querySelector("table");
    generateTable(table, data);
    generateTableHead(table, Object.keys(data[0]));

});

back.addEventListener('click', (event) => {
    window.location.reload();
});
