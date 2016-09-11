/* Conversion type (formula identifier)
 *  0 = parametric, linear
 *  1 = tabular with interpolation
 *  2 = tabular
 *  6 = polynomial function
 *  7 = exponential function
 *  8 = logarithmic function
 *  9 = rational conversion formula
 *  10 = ASAM-MCD2 Text formula
 *  11 = ASAM-MCD2 Text Table, (COMPU_VTAB)
 *  12 = ASAM-MCD2 Text Range Table (COMPU_VTAB_RANGE)
 *  132 = date (Based on 7 Byte Date data structure)
 *  133 = time (Based on 6 Byte Time data structure)
 *  65535 = 1:1 conversion formula (Int = Phys)
 */

CCBlock = function(arrayBuffer, blockOffset, littleEndian, _parent){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.physicalValueRangeValid = null;
  this.minPhysicalSignalValue = null;
  this.maxPhysicalSignalValue = null;
  this.physicalUnit = null;
  this.conversionType = null;
  this.sizeInformation = null;
  this.additionalConversionData = null;

  this.pThisBlock = blockOffset;
  this.parent = _parent;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

CCBlock.conversionFomulas = {
  0:  // 0 = parametric, linear
    function(rawData, params){
      return rawData * params[1] + params[0];
    },
  1:  // 1 = tabular with interpolation
    function(rawData, params){
      var Int_0 = params[0];
      if(rawData < Int_0){
        var Phys_0 = params[1];
        return Phys_0;
      }

      for(var i = 1; i < (params.length / 2); i++){
        var Int_i = params[2*i];
        if(rawData < Int_i){
          var Phys_i = params[2*i+1];
          var Int_i_1 = params[2*i-2];
          var Phys_i_1 = params[2*i-1];
          return Phys_i_1 + (Phys_i - Phys_i_1) / (Int_i - Int_i_1) * (rawData - Int_i_1);
        }
      }

      var Phys_n = params[params.length - 1];
      return Phys_n;
    },
  2:  // 2 = tabular
    function(rawData, params){
      var Int_0 = params[0];
      if(rawData < Int_0){
        var Phys_0 = params[1];
        return Phys_0;
      }

      for(var i = 1; i < (params.length / 2); i++){
        var Int_i = params[2*i];
        if(rawData < Int_i){
          var Phys_i_1 = params[2*i-1];
          return Phys_i_1;
        }
      }

      var Phys_n = params[params.length - 1];
      return Phys_n;
    },
  6:  // 6 = polynomial function
    function(rawData, params){
      return (params[1] - (params[3] * (rawData - params[4]))) / (params[2] * (rawData - params[4]) - params[0]);
    },
  7:  // 7 = exponential function
    function(rawData, params){
      if(params[3] == 0){
        return Math.log(((rawData - params[6]) * params[5] - params[2]) / params[0]) / params[1];
      }
      else if(params[0] == 0){
        return Math.log((params[2] / (rawData - params[6]) - params[5]) / params[3]) / params[4];
      }

      return null;
    },
  8:  // 8 = logarithmic function
    function(rawData, params){
      if(params[3] == 0){
        return Math.exp(((rawData - params[6]) * params[5] - params[2]) / params[0]) / params[1];
      }
      else if(params[0] == 0){
        return Math.exp((params[2] / (rawData - params[6]) - params[5]) / params[3]) / params[4];
      }

      return null;
    },
  9:  // 9 = rational conversion formula
    function(rawData, params){
      return (params[0] * rawData * rawData + params[1] * rawData + params[2]) / (params[3] * rawData * rawData + params[4] * rawData + params[5]);
    },
  10: // 10 = ASAM-MCD2 Text formula
    function(rawData, params){
      var eqnStr = params[0];  // an equation including X1
      if(!/[A-WYZa-z"'`]/.test(eqnStr) && !/X[^1]/.test(eqnStr)){
        try{
          var fcnStr = "return ( " + eqnStr + " )";
          var fcn = new Function("X1", fcnStr);
          var ans = fcn(rawData);
          return ans;
        }
        catch(e){
          var errMessage = "Error Message: " + e.message + ", Error Name: " + e.name;
          if(e.fileName)  str += ", File Name: " + e.fileName;
          if(e.lineNumber)  str +=", Line Number: " + e.lineNumber;
          console.log(errMessage);
        }
      }

      return null;
    },
  11: // 11 = ASAM-MCD2 Text Table, (COMPU_VTAB)
    function(rawData, params){
      for(var i = 0; i < params.length / 2; i++){
        var Int_i = params[2*i];
        if(Int_i == rawData){
          var Text_i = params[2*i+1];
          return Text_i;
        }
      }

      return null;
    },
  12: // 12 = ASAM-MCD2 Text Range Table (COMPU_VTAB_RANGE)
    function(rawData, params){
      return null;              // not supported yet.
    },
  132:  // 132 = date (Based on 7 Byte Date data structure)
    function(ary_u8, params, littleEndian){
      var abuf = ary_u8.buffer;
      var offset = 0;

      var data = new Array(6);

      var len = 2;
      data[0] = MDF.ab2uint16(abuf, offset, littleEndian);
      offset += len;

      for(var i = 1; i < data.length; i++){
        len = 1;
        data[i] = MDF.ab2uint8(abuf, offset);
        offset += len;
      }
      return data;
    },
  133:  // 133 = time (Based on 6 Byte Time data structure)
    function(ary_u8, params, littleEndian){
      var abuf = ary_u8.buffer;
      var offset = 0;

      var data = new Array(2);
      var len = 6;
      data[0] = MDF.ab2uint32(abuf, offset, littleEndian);
      offset += len;

      len = 2;
      data[1] = MDF.ab2uint16(abuf, offset, littleEndian);
      offset += len;
      return data;
    },
  65535:  // 65535 = 1:1 conversion formula (Int = Phys)
    function(rawData, params){
      return rawData;
    }
};

CCBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.physicalValueRangeValid = MDF.ab2bool(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 8;
  this.minPhysicalSignalValue = MDF.ab2double(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 8;
  this.maxPhysicalSignalValue = MDF.ab2double(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 20;
  this.physicalUnit = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.conversionType = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.sizeInformation = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = this.blockSize - ( offset - blockOffset );
  this.setAdditinalConversionData(arrayBuffer, offset, littleEndian);
  offset += len;

  this.convert = (function(little){
    var convType = this.conversionType;
    var params = this.additionalConversionData;

    if(convType == 132 || convType == 133){
      return function(rawData){
        return CCBlock.conversionFomulas[convType](rawData, params, little);
      };
    }

    return function(rawData){
      return CCBlock.conversionFomulas[convType](rawData, params);
    };
  }).call(this, littleEndian);
};

CCBlock.prototype.setAdditinalConversionData = function(arrayBuffer, initialOffset, littleEndian){
  var data = [];
  var offset = initialOffset;

  switch(this.conversionType){
  case 0:
  case 6:
  case 7:
  case 8:
  case 9:
    data = new Array(this.sizeInformation);
    for(var i = 0; i < data.length; i++){
      var len = 8;
      data[i] = MDF.ab2double(arrayBuffer, offset, littleEndian);
      offset += len;
    }
    break;
  case 1:
  case 2:
    data = new Array(this.sizeInformation * 2);
    for(var i = 0; i < data.length; i++){
      var len = 8;
      data[i] = MDF.ab2double(arrayBuffer, offset, littleEndian);
      offset += len;
    }
    break;
  case 10:
    var len = 256;
    data = [ MDF.ab2str(arrayBuffer, offset, len) ];
    offset += len;
    break;
  case 11:
    data = new Array(this.sizeInformation * 2);
    for(var i = 0; i < this.sizeInformation; i++){
      var len = 8;
      data[2*i] = MDF.ab2double(arrayBuffer, offset, littleEndian);
      offset += len;

      len = 32;
      data[2*i+1] = MDF.ab2str(arrayBuffer, offset, len);
      offset += len;
    }
    break;
  case 12:
    data = new Array( (this.sizeInformation + 1) * 3);
    try{
      for(var i = 0; i < this.sizeInformation + 1; i++){
        var len = 8;
        data[3*i] = MDF.ab2double(arrayBuffer, offset, littleEndian);
        offset += len;

        len = 8;
        data[3*i+1] = MDF.ab2double(arrayBuffer, offset, littleEndian);
        offset += len;

        len = 4;
        data[3*i+2] = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
        offset += len;
      }
    }
    catch(e){
      var errMessage = "Error Message: " + e.message + ", Error Name: " + e.name;
      if(e.fileName)  str += ", File Name: " + e.fileName;
      if(e.lineNumber)  str +=", Line Number: " + e.lineNumber;
      console.log(errMessage);
    }
    break;
  case 132:
    break;
  case 133:
    break;
  case 65535:
    break;
  }

  this.additionalConversionData = data;
};

// This is dummy function to advoid undefined error.
CCBlock.prototype.convert = function(rawData){
  return null;
};

CCBlock.prototype.convertAll = function(rawDataArray){
  var actDataArray = [];
  for(var i = 0; i < rawDataArray.length; i++){
    actDataArray.push(this.convert(rawDataArray[i]));
  }
  return actDataArray;
};
