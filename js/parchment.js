var parchment={options:{container:"#parchment",lib_path:"lib/",page_title:1,panels:["search","url","about"],proxy_url:"http://zcode.appspot.com/proxy/"},lib:{}};!function(t,n){var e=t.parchment,a=IFF.subClass({init:function(t,n){this.title=n,this._super(),this.chunks.push({type:"ZCOD",data:t}),this.data=t}});n((function(){t.parchment_options&&n.extend(e.options,parchment_options);e.options,e.options.default_story;var o=t.gameimage,i=t.runner=new GnustoRunner(e.options);i.toParchment=function(t){console.log("BUG: toParchment/fromRunner should not be called",t)},i.load(new a(o).data),i.createSaveFiles(t.gamedat_savefiles),i.startGame(),t.bundle&&t.bundle.init(i)}))}(this,jQuery);