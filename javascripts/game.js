var MFNames = [null,"Bare Misfunction","Tiny Misfunction","Small Misfunction","Regular Misfunction","Large Misfunction","Huge Misfunction","Corrupted Files","Corrupted Programs"]

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
    return num.toNumber().toFixed(decimalPoints).replace("."+"0".repeat(decimalPoints),"")
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
  if (player.MFBought[tier] % 10 == 0) {
    player.MFCost[tier] = player.MFCost[tier].times(player.MFCostIncRate[tier])
    player.MFBoost[tier] = player.MFBoost[tier].times(new Decimal(2))
  }
  return true
}

function doCE() {
  if (player.CE >= 4 || player.MFBought[player.CE+4] < 10) return false
  reset(["bugs","MFAmount","MFCost","MFBoost","MFBought"])
  player.CE++
  return true
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function hardReset() {
  if (confirm("ARE YOU SURE YOU WANNA RESET ENTIRE GAME???")) {
    player = getInitPlayer()
    save()
    location.reload()
  }
}

function save() {
  localStorage.setItem('saveFile',btoa(JSON.stringify(player)))
}

function load() {
  try {
    player = strToDec(JSON.parse(atob(localStorage.getItem("saveFile"))))
  } catch(error) {
    player = getInitPlayer()
  }
  if (player.version < 2) {
    player.time = 0
  }
  player.version = getInitPlayer().version
}

function strToDec(inp) {
  inp.bugs = new Decimal(inp.bugs)
  for (i=1;i<9;i++) {
    inp.MFAmount[i] = new Decimal(inp.MFAmount[i])
    inp.MFCost[i] = new Decimal(inp.MFCost[i])
    inp.MFBoost[i] = new Decimal(inp.MFBoost[i])
    inp.MFCostIncRate[i] = new Decimal(inp.MFCostIncRate[i])
  }
  return inp
}

function reset(keys) {
  temp = getInitPlayer()
  keys.forEach(function(key) {
    player[key] = temp[key]
  })
}

function getInitPlayer() {
  var initPlayer = {
    bugs: new Decimal(10),
    MFAmount: [null,new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)],
    MFCost: [null,new Decimal(10),new Decimal(2e2),new Decimal(2e4),new Decimal(2e6),new Decimal(2e8),new Decimal(2e10),new Decimal(2e12),new Decimal(2e14)],
    MFBoost: [null,new Decimal(1),new Decimal(1),new Decimal(1),new Decimal(1),new Decimal(1),new Decimal(1),new Decimal(1),new Decimal(1)],
    MFCostIncRate: [null,new Decimal(1e4),new Decimal(1e4),new Decimal(1e5),new Decimal(1e6),new Decimal(1e6),new Decimal(1e7),new Decimal(1e7),new Decimal(1e8)],
    MFBought: [null,0,0,0,0,0,0,0,0],
    CE: 0,
    version: 2,
    time: 0
  }
  return strToDec(JSON.parse(JSON.stringify(initPlayer)))
}

function buy10(tier) {
  buy10Cost = player.MFCost[tier]*(10-(player.MFBought[tier] % 10))
  if (player.bugs.lt(buy10Cost)) return false
  player.bugs = player.bugs.sub(buy10Cost)
  player.MFAmount[tier] = player.MFAmount[tier].add(10-(player.MFBought[tier] % 10))
  player.MFBought[tier] += 10-(player.MFBought[tier] % 10)
  player.MFCost[tier] = player.MFCost[tier].times(player.MFCostIncRate[tier])
  player.MFBoost[tier] = player.MFBoost[tier].times(new Decimal(2))
  return true
}

function maxAll() {
  do {
    boughtSmth = false
    for (i=4+player.CE;i>0;i--) {
      boughtSmth = boughtSmth || buy10(i)
    }
  } while (boughtSmth)
}

function gameTick() {
  s=(new Date().getTime()-player.time)/1000
  if (player.time > 0) {
    player.time = new Date().getTime()
    for (i=1;i<9;i++) {
      if (i>1) {
        player.MFAmount[i-1] = player.MFAmount[i-1].add(Decimal.floor(player.MFAmount[i]).mul(player.MFBoost[i]).mul(player.CE >= i?2:1).div(2).times(s))
	document.getElementById("MPS"+i.toString()).innerHTML = format(Decimal.floor(player.MFAmount[i]).mul(player.MFBoost[i]).mul(player.CE >= i?2:1).div(2),1)
      }
      document.getElementById("mf" + i.toString() + "Amount").innerHTML = Decimal.floor(player.MFAmount[i]).eq(player.MFBought[i])?format(player.MFAmount[i]):format(Decimal.floor(player.MFAmount[i]))+"("+(player.MFBought[i] % 10).toString()+")"
      document.getElementById("mf" + i.toString() + "Cost").innerHTML = format(player.MFCost[i])
      if (i<5) document.getElementById("mf" + (i+4).toString()).style = "display: " + (player.CE>=i?"block":"none")
      document.getElementById("mf" + i.toString() + "Cost2").innerHTML = format(player.MFCost[i]*(10-(player.MFBought[i] % 10)))
    }
    document.getElementById("BPS").innerHTML = format(Decimal.floor(player.MFAmount[1]).times(player.MFBoost[1]).times(player.CE >= 1?2:1))
    player.bugs = player.bugs.add(Decimal.floor(player.MFAmount[1]).times(player.MFBoost[1]).times(player.CE >= 1?2:1).times(s))
    document.getElementById("bugs").innerHTML = format(player.bugs)
    if (player.CE == 4) document.getElementById("CE").style = "display: none"
    else document.getElementById("CE").style = "display: block"
    document.getElementById("CEReq").innerHTML = "10 " + MFNames[player.CE+4] + " Bought"
    document.getElementById("CEUnlocks").innerHTML = MFNames[player.CE+5]
    if (player.MFBought[8] >= 30) {
      target = getRandomInt(0,6)
      target2 = getRandomInt(0,6)
      while (target2 == target) {
        target2 = getRandomInt(0,6)
      }
      word = ["E","r","r","o","r"]
      word[target] = String.fromCharCode(getRandomInt(33,127))
      word[target2] = String.fromCharCode(getRandomInt(33,127))
      document.getElementById("errorText").innerHTML = "500 Server " + word.join("")
    } else {
      document.getElementById("errorText").innerHTML = "500 Server Error"
    }
  } else player.time = new Date().getTime()
}

function gameStart() {
  load()
  gameInterval = setInterval(gameTick,0)
  autoSave = setInterval(save,1000)
  document.getElementById("jsCheck").style = "display: none"
}
