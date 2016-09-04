*Usage*

var mdf;

var reader = new FileReader();
reader.onload = function(e){
  var arrayBuffer = e.target.result;
  mdf = new MDF(arrayBuffer);
};

reader.readAsArrayBuffer(/* File Object */);


This software is released under the MIT License, see LICENSE.txt.
