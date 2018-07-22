var player = {
  bugs: new Decimal(10),
  MFAmount: [null,new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)],
  MFCost: [null,new Decimal(10),new Decimal(100),new Decimal(1e3),new Decimal(1e4)],
  MFBoost: new Decimal(1),
  MFCostIncRate: [null,new Decimal(1e4),new Decimal(1e4),new Decimal(1e5),new Decimal(1e6)],
  MFBought: [null,0,0,0,0]
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

function buyMF(tier) {
  if (player.MFCost[tier].gt(player.bugs)) return false;
  player.bugs = player.bugs.sub(player.MFCost[tier])
  player.MFAmount[tier] = player.MFAmount[tier].add(1)
  player.MFBought[tier]++
  if (player.MFBought[tier] >= 10) player.MFCost[tier] = player.MFCost[tier].times(player.MFCostIncRate[tier])
  if (player.MFBought[tier] > 10) {
    player.MFBoost = player.MFBoost.times(new Decimal(1.02))
  }
  return true
}

function gameTick() {
  for (i=1;i<5;i++) {
    if (i>1) player.MFAmount[i-1] = player.MFAmount[i-1].add(player.MFAmount[i].mul(player.MFBoost).div(20))
    document.getElementById("mf" + i.toString() + "Amount").innerHTML = Decimal.floor(player.MFAmount[i]).eq(player.MFBought[i])?format(player.MFAmount[i]):format(player.MFAmount[i])+"("+player.MFBought[i].toString()+")"
    document.getElementById("mf" + i.toString() + "Cost").innerHTML = format(player.MFCost[i])
  }
  document.getElementById("mf1BPS").innerHTML = format(Decimal.floor(player.MFAmount[1]).times(player.MFBoost))
  player.bugs = player.bugs.add(Decimal.floor(player.MFAmount[1]).times(player.MFBoost).div(10))
  document.getElementById("bugs").innerHTML = format(player.bugs)
}

function gameStart() {
  gameInterval = setInterval(gameTick,20)
}