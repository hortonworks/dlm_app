import {Component, Input, OnInit} from '@angular/core';

declare var d3: any;
declare var nv: any;

@Component({
  selector: 'asset-column-visual'
,  templateUrl: './asset-column-visual.component.html'
,  styleUrls: ['./asset-column-visual.component.scss']
})

export class AssetColumnVisualComponent implements OnInit{

	@Input() data;
	onlyHisto :boolean = true;
	showPi : boolean = false;
	ngOnInit () {
		if(!this.data) return;
		if(this.data.quartiles)
			this.onlyHisto = false;
		if(this.data.cardinality < 6) 
			this.showPi = true;
		if(this.showPi)
			this.drawPiChart();
		else 
			this.drawHisto();
		if(!this.data.quartiles) return;
		this.drawBoxPlot();
	}
	drawHisto () {	
		var _this = this;
		nv.addGraph(function() {
			var dataa = _this.getDataForHistogram();
	        var chart = nv.models.discreteBarChart()
	            .x(function(d) { return d.label })
	            .y(function(d) { return d.value })
	            .staggerLabels(false)
	            //.staggerLabels(historicalBarChart[0].values.length > 8)
	            .showValues(false)
	            .duration(0)
	            ;
	        chart.xAxis.axisLabel(_this.data.name);
	        chart.yAxis.axisLabel("Count");
	        chart.yAxis.tickFormat(d3.format('d'));
	        d3.select('#chart1 svg')
	            .datum(dataa)
	            .call(chart);
	        nv.utils.windowResize(chart.update);

	        var barsWidth:number = d3.select(".nv-barsWrap").node()['getBoundingClientRect']().width;
	        var padding=1, allowedWidth = barsWidth/dataa[0].values.length;

	        function wrap() {
			  var self = d3.select(this),
			    textLength = self.node()['getComputedTextLength'](),
			    text = self.text();
			  while (textLength > (allowedWidth - 2 * padding) && text.length > 0) {
			    text = text.slice(0, -1);
			    self.text(text + '...');
			    textLength = self.node()['getComputedTextLength']();
			  }
			}
			d3.select(".nv-axis")
				.selectAll(".tick")
				.selectAll("text")
				.html("")
				.append('tspan').text(function(d) {
				return d;
				}).each(wrap);

			(_this.data.type != "string") && d3.select(".nv-axis")
				.selectAll(".tick")
				.selectAll("text")
				.attr('transform', function(d,i,j) { return 'translate (-'+allowedWidth/2 +', 8)' }) ;	

	        // var label = d3.select(".nv-axislabel");
	        // label.attr("y", +(label.attr("y"))-5);

	        return chart;
	    });	
	}
	getDataForHistogram () {
		return [{
			values: JSON.parse(this.data.histogram).map(obj=>{return {"label":(obj.bin.toFixed)?obj.bin.toFixed(2):obj.bin, "value":obj.count, "color": "#60A947"}}),
			key: this.data.name,
			color: "#ff7f0e"
		}];
	}
	drawBoxPlot () {
		var domainRange = this.data.maxValue - this.data.minValue;
		var _this = this;
		nv.addGraph(function() {
		var chart = nv.models.boxPlotChart()
			  .x(function(d) { return d.label })
			  .staggerLabels(true)
			  .maxBoxWidth(75) // prevent boxes from being incredibly wide
			  .yDomain([_this.data.minValue-domainRange/10, _this.data.maxValue+domainRange/10])
			  ;
		chart.yAxis.axisLabel(_this.data.name);
			  
		d3.select('#chart2 svg')
		  .datum(_this.getDataForBoxPlot())
		  .call(chart);
		nv.utils.windowResize(chart.update);
		return chart;
		});
	}
	getDataForBoxPlot () {
		var quartiles = JSON.parse(this.data.quartiles);
		return [{
          label: "Boxplot with max, min and mean",
          values: {
            Q1: quartiles[1].value,
            Q2: quartiles[2].value,
            Q3: quartiles[3].value,
            whisker_low: quartiles[0].value,
            whisker_high: quartiles[4].value,
            outliers: [this.data.maxValue, this.data.meanValue, this.data.minValue]
          }
        }]
	}
	drawPiChart () {
		var _this = this;
		nv.addGraph(function() {
			var chart = nv.models.pieChart()
			    .x(function(d) { return d.key })
			    .y(function(d) { return d.y })
			    // .width(width)
			    // .height(height)
			    ['showTooltipPercent'](true);
			d3.select("#chart1 svg")
				.datum(_this.getDataForPiChart())
				.transition().duration(1200)
				// .attr('width', width)
				// .attr('height', height)
				.call(chart);
			return chart;
		});
	}
	getDataForPiChart () {
		return JSON.parse(this.data.histogram).map(obj=>{return {"key":(obj.bin.toFixed)?obj.bin.toFixed(2):obj.bin, "y":obj.count, "color": "#60A947"}});
	}

}
