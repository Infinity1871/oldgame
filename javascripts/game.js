var player = {
  bugs: new Decimal(10),
  DLAmount: [null,new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)],
  DLCost: [null,new Decimal(10),new Decimal(100),new Decimal(1e3),new Decimal(1e4)],
  DLBoost: new Decimal(1),
  DLCostIncRate: [null,new Decimal(1e4),new Decimal(1e4),new Decimal(1e5),new Decimal(1e6)],
  DLBought: [null,0,0,0,0]
}

function format(num,decimalPoints=0,offset=0,rounded=true) {
  num=new Decimal(num)
  if (num.lt(10)&&!rounded) {
	  var sub10=num.toFixed(decimalPoints)
	  if (parseFloat(sub10)<10) return sub10
  }
  if (isNaN(num.mantissa)) {
    return '?'
  } else if (num.gte(1/0)) {
    return 'Infinite'
  } else if (num.lt(999.5)) {
    return Math.round(num.toNumber())
  } else {
    var abbid=Math.max(Math.floor(num.e/3)-offset,0)
    var mantissa=num.div(Decimal.pow(1000,abbid)).toFixed((abbid>0&&decimalPoints<2)?2:decimalPoints)
    if (mantissa==Math.pow(1000,1+offset)) {
      mantissa=mantissa/1000
      abbid+=1
    }
    return (num.div(Decimal.pow(10,num.e)).toFixed((abbid>0&&decimalPoints<2)?2:decimalPoints))+"e"+num.e
  }
}

function buyDL(tier) {
  if (player.DLCost[tier].gt(player.bugs)) return false;
  player.bugs = player.bugs.sub(player.DLCost[tier])
  player.DLAmount[tier] = player.DLAmount[tier].add(1)
  player.DLBought[tier]++
  if (player.DLBought[tier] >= 10) player.DLCost[tier] = player.DLCost[tier].times(player.DLCostIncRate[tier])
  if (player.DLBought[tier] > 10) {
    player.DLBoost = player.DLBoost.times(new Decimal(1.02))
  }
  return true
}

function gameTick() {
  for (i=1;i<5;i++) {
    if (i>1) player.DLAmount[i-1] = player.DLAmount[i-1].add(player.DLAmount[i].mul(player.DLBoost).div(20))
    document.getElementById("dl" + i.toString() + "Amount").innerHTML = Decimal.floor(player.DLAmount[i]).eq(player.DLBought[i])?format(player.DLAmount[i]):format(player.DLAmount[i])+"("+player.DLBought[i].toString()+")"
    document.getElementById("dl" + i.toString() + "Cost").innerHTML = format(player.DLCost[i])
  }
  document.getElementById("dl1BPS").innerHTML = format(Decimal.floor(player.DLAmount[1]).times(player.DLBoost))
  player.bugs = player.bugs.add(Decimal.floor(player.DLAmount[1]).times(player.DLBoost).div(10))
  document.getElementById("bugs").innerHTML = format(player.bugs)
}

function gameStart() {
  gameInterval = setInterval(gameTick,20)
}