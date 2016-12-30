import {Component, OnInit, AfterViewInit, ElementRef, Input, SimpleChanges, OnChanges} from '@angular/core';
import {AtlasLineageService} from '../../services/atlas-lineage.service';
import {AtlasLineage} from '../../models/altas-lineage';
import {AtlasEntityService} from '../../services/atlas-entity.service';
import {Globals} from '../../shared/utils/globals';
import {StringUtils} from '../../shared/utils/stringUtils';

declare var d3:any;
declare var dagreD3:any;
declare var jQuery:any;

@Component({
    selector: 'atlas-lineage',
    templateUrl: 'assets/app/components/atlas-lineage/atlas-lineage.component.html',
    styleUrls: ['assets/app/components/atlas-lineage/atlas-lineage.component.css']
})
export class AtlasLineageComponent implements OnInit, AfterViewInit, OnChanges {

    guid: string;
    inputData: AtlasLineage;
    outputData: AtlasLineage;
    edgesAndvertices: {edges: {[key: string]: string[]}, vertices: {}};
    startingPoint: string[] = [];

    g: any;
    asyncFetchCounter: number = 0;
    outputState: boolean = false;
    jqueryNativeElement: any;

    @Input() search: string = '';
    @Input() dataSourceName: string;
    @Input() hostName: string;

    constructor(private nativeElement: ElementRef, private atlasLineageService: AtlasLineageService,
                private atlasEntityService: AtlasEntityService) {
        this.jqueryNativeElement = jQuery(this.nativeElement.nativeElement);
    }

    init(table: string) {
        this.clearSVG();
        this.startingPoint = [];
        this.edgesAndvertices = {
          edges: {},
          vertices: {}
        };
        this.outputState = false;

        this.atlasLineageService.getTable(this.hostName, this.dataSourceName, table).subscribe(table => {
            this.guid = table['$id$']['id'];
            this.atlasLineageService.getLineage(this.hostName, this.dataSourceName , this.guid).subscribe(lineage => {
                this.inputData = JSON.parse(lineage['inputs']);
                this.generateData(this.inputData, 'input');

                this.outputData = JSON.parse(lineage['outputs']);
                this.generateData(this.outputData, 'output');
                this.outputState = true;
            });
        });
    }

    clearSVG() {
        let svg = this.jqueryNativeElement.find('svg')[0];
        let parentElement = svg.parentElement;
        let emptySvg = svg.cloneNode(false);
        parentElement.removeChild(svg);
        parentElement.appendChild(emptySvg);

        this.g = new dagreD3.graphlib.Graph()
            .setGraph({
                nodesep: 50,
                ranksep: 90,
                rankdir: 'LR',
                marginx: 20,
                marginy: 20,
                transition: function transition(selection: any) {
                    return selection.transition().duration(500);
                }
            })
            .setDefaultEdgeLabel(function() {
                return {};
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['search'] && changes['search'].currentValue) {
          this.init(changes['search'].currentValue);
        }
    }

    ngOnInit() {
        //
    }

    generateData(inputData: AtlasLineage, type: string) {
        let edges = inputData.results.values.edges;
        let vertices = inputData.results.values.vertices;

        if (edges && Object.keys(edges).length >0) {
            if (type === 'input') {
                this.edgesAndvertices = {
                    edges: {},
                    vertices: vertices
                };

                let keys = Object.keys(edges);
                for (let key of keys) {
                    for (let val1 of edges[key]) {
                        if (!edges[val1]) {
                            this.startingPoint.push(val1);
                        }
                        if (this.edgesAndvertices.edges[val1]) {
                            this.edgesAndvertices.edges[val1].push(key);
                        } else {
                            this.edgesAndvertices.edges[val1] = [key];
                        }
                    }
                }
            }
            else {
                this.edgesAndvertices = inputData.results.values;
                this.startingPoint = [this.guid];
            }
            this.makeNode(this.edgesAndvertices);
        }
        else {
            if (type === 'output') {
                this.outputState = true;
            }
        }

        if (this.asyncFetchCounter <= 0) {
            if (this.edgesAndvertices) {
                this.createGraph(this.edgesAndvertices, this.startingPoint);
            } else if (this.outputState && !this.edgesAndvertices) {
                this.jqueryNativeElement.find('.fontLoader').hide();
                this.jqueryNativeElement.find('svg').height('100');
                this.jqueryNativeElement.find('svg').html('<text x="' + (this.jqueryNativeElement.find('svg').width() - 150) / 2 + '" y="' + this.jqueryNativeElement.find('svg').height() / 2 + '" fill="black">No lineage data found</text>');
            }
        }
    }

    makeNode(edgesAndvertices: {edges: {}, vertices: {}}) {
        let edges = edgesAndvertices.edges;
        let vertices = edgesAndvertices.vertices;
        let allKeys: string[] = [];

        let keys = Object.keys(edges);
        for (let key of keys) {
            allKeys.push(key);
            for (let val1 of edges[key]) {
                allKeys.push(val1);
            }
        }

        // let uniquNode = this.unique(allKeys);
        let uniquNode =  allKeys.filter((item, i) => { return allKeys.indexOf(item) === i; });
        for (let val of uniquNode) {
            let obj = {};
            if (vertices[val] && vertices[val].values) {
                obj['label'] = vertices[val].values.name;
                obj['toolTiplabel'] = vertices[val].values.name;
                if (vertices[val].values.vertexId && vertices[val].values.vertexId.values && vertices[val].values.vertexId.values.typeName) {
                    let temp = obj['label'] + ' (' + vertices[val].values.vertexId.values.typeName + ')';
                    obj['label'] = temp;
                    obj['toolTiplabel'] = temp;
                }
                obj['label'] = StringUtils.trunc(obj['label'], 18);
                obj['id'] = val;
                obj['class'] = 'type-TOP';
                obj['shape'] = 'img';
                obj['typeName'] = vertices[val].values.vertexId.values.typeName;
                if (vertices[val].values.state) {
                    obj['state'] = vertices[val].values.state;
                } else if (vertices[val].values.vertexId.values.state) {
                    obj['state'] = vertices[val].values.vertexId.values.state;
                }
                if (val && obj) {
                    this.g.setNode(val, obj);
                }
            } else {
                this.fetchLoadProcess(val);
            }

        }
    }

    fetchLoadProcess(id: string) {
        ++this.asyncFetchCounter;
        this.atlasEntityService.getLineage(this.hostName, this.dataSourceName , id).subscribe(data => {
            this.addValueInObject(data);
        });
    }

    addValueInObject(data) {
        let obj = {};
        if (data && data.definition) {
            if (data.definition.values) {
                let values = data.definition.values;
                obj['label'] = values.name;

                obj['toolTiplabel'] = values.name;
                if (data.definition.typeName) {
                    let temp = obj['label'] + ' (' + data.definition.typeName + ')';
                    obj['label'] = temp;
                    obj['toolTiplabel'] = temp;
                }
                obj['label'] = StringUtils.trunc(obj['label'], 18);
                obj['id'] = data.GUID;
                if (values.queryText) {
                    obj['queryText'] = values.queryText;
                }
                if (data.definition.id && data.definition.id.state) {
                    obj['state'] = data.definition.id.state;
                }
            }
        } else {
            obj['label'] = '';
            obj['toolTiplabel'] = '';
        }
        obj['shape'] = 'img';
        obj['class'] = 'type-TOP';
        if (data.GUID) {
            this.g.setNode(data.GUID, obj);
        } else {
            if (data && data.definition) {
                if ((typeof data.definition.id) === 'string') {
                    this.g.setNode(data.definition.id, obj);
                } else if (typeof(data.definition.id.id) === 'string') {
                    this.g.setNode(data.definition.id.id, obj);
                }
            }
        }
        --this.asyncFetchCounter;
        if (this.asyncFetchCounter === 0) {
            if (this.edgesAndvertices) {
                this.createGraph(this.edgesAndvertices, this.startingPoint);
            } else if (this.outputState && !this.edgesAndvertices) {
                this.addNoDataMessage();
            }
        }
    }

    unique(a: any[]) {
        let temp = {};
        let r = [];

        for (let i = 0; i < a.length; i++) {
            temp[a[i]] = true;
        }
        for (let k of Object.keys(temp)

            ) {
            r.push(k);
        }
        return r;
    }

    addNoDataMessage() {
        this.jqueryNativeElement.find('svg').height('100');
        this.jqueryNativeElement.find('svg').html('<text x="' + (this.jqueryNativeElement.find('svg').width() - 150) / 2 + '" y="' + this.jqueryNativeElement.find('svg').height() / 2 + '" fill="black">No lineage data found</text>');
        this.jqueryNativeElement.find('.fontLoader').hide();
    }

    createRemaningEdge(obj: {}, starting: string) {
        if (obj[starting] && obj[starting].length) {
            for (let val of obj[starting]) {
                if (starting && val) {
                    this.g.setEdge(starting, val, { 'arrowhead': 'arrowPoint', lineInterpolate: 'basis' });
                }
                this.createRemaningEdge(obj, val);
            }
        }
    }

    createGraph(edgesAndvertices, startingPoint) {
        let that = this;
        let lastVal = '';
        for (let val of startingPoint) {
            for (let val1 of edgesAndvertices.edges[val]) {
                if (val && val1) {
                    this.g.setEdge(val, val1, { 'arrowhead': 'arrowPoint', lineInterpolate: 'basis' });
                }
                this.createRemaningEdge(edgesAndvertices.edges, val1);
            }
        }

        this.g.nodes().forEach(function(v) {
            let node = that.g.node(v);
            // Round the corners of the nodes
            if (node) {
                node.rx = node.ry = 5;
            }
        });

        if (this.outputState) {
            // Create the renderer
            let render = new dagreD3.render();
            // Add our custom arrow (a hollow-point)
            render.arrows().arrowPoint = function normal(parent, id, edge, type) {
                let marker = parent.append('marker')
                    .attr('id', id)
                    .attr('viewBox', '0 0 10 10')
                    .attr('refX', 9)
                    .attr('refY', 5)
                    .attr('markerUnits', 'strokeWidth')
                    .attr('markerWidth', 10)
                    .attr('markerHeight', 8)
                    .attr('orient', 'auto');

                let path = marker.append('path')
                    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                    .style('stroke-width', 1)
                    .style('stroke-dasharray', '1,0')
                    .style('fill', '#cccccc')
                    .style('stroke', '#cccccc');
                dagreD3.util.applyStyle(path, edge[type + 'Style']);
            };
            render.shapes().img = function circle(parent, bbox, node) {
                // let r = Math.max(bbox.width, bbox.height) / 2,
                let shapeSvg = parent.insert('image')
                    .attr('class', 'nodeImage')
                    .attr('xlink:href', function(d) {
                        if (node) {
                            if (node.typeName) {
                                if (Globals.entityStateReadOnly[node.state]) {
                                    return 'assets/images/atlas/icon-table-delete.png';
                                } else if (node.id === that.guid) {
                                    return 'assets/images/atlas/icon-table-active.png';
                                } else {
                                    return 'assets/images/atlas/icon-table.png';
                                }
                            } else {
                                if (Globals.entityStateReadOnly[node.state]) {
                                    return 'assets/images/atlas/icon-gear-delete.png';
                                } else if (node.id === that.guid) {
                                    return 'assets/images/atlas/icon-gear-active.png';
                                } else {
                                    return 'assets/images/atlas/icon-gear.png';
                                }
                            }
                        }
                        else {
                            return '';
                        }
                    }).attr('x', '-12px')
                    .attr('y', '-12px')
                    .attr('width', '24px')
                    .attr('height', '24px');
                /*shapeSvg = parent.insert('circle', ':first-child')
                 .attr('x', 35)
                 .attr('y', 35)
                 .attr('r', 20);*/
                node.intersect = function(point) {
                    // return dagreD3.intersect.circle(node, points, point);
                    return dagreD3.intersect.circle(node, 13, point);
                };
                return shapeSvg;
            };


            const zoomed = function() {
                svgGroup.attr('transform',
                    'translate(' + zoom.translate() + ')' +
                    'scale(' + zoom.scale() + ')'
                );
            };

            // Set up an SVG group so that we can translate the final graph.
            let svg = d3.select(this.jqueryNativeElement.find('svg')[0]),
                svgGroup = svg.append('g');
            let zoom = d3.behavior.zoom()
                .scaleExtent([0.5, 6])
                .on('zoom', zoomed);

            const interpolateZoom = function(translate, scale) {
                return d3.transition().duration(350).tween('zoom', function() {
                    let iTranslate = d3.interpolate(zoom.translate(), translate),
                        iScale = d3.interpolate(zoom.scale(), scale);
                    return function(t) {
                        zoom
                            .scale(iScale(t))
                            .translate(iTranslate(t));
                        zoomed();
                    };
                });
            };

            const zoomClick = function(this:any){
                let clicked = d3.event.target,
                    direction = 1,
                    factor = 0.2,
                    target_zoom = 1,
                    center = [that.g.graph().width / 2, that.g.graph().height / 2],
                    extent = zoom.scaleExtent(),
                    translate = zoom.translate(),
                    translate0 = [],
                    l = [],
                    view = { x: translate[0], y: translate[1], k: zoom.scale() };

                d3.event.preventDefault();
                direction = (this.id === 'zoom_in') ? 1 : -1;
                target_zoom = zoom.scale() * (1 + factor * direction);
                if (target_zoom < extent[0] || target_zoom > extent[1]) {
                    return;
                }

                translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
                view.k = target_zoom;
                l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

                view.x += center[0] - l[0];
                view.y += center[1] - l[1];

                interpolateZoom([view.x, view.y], view.k);
            };

            d3.selectAll('button.zoomButton').on('click', zoomClick);
            let tooltip = d3.tip()
                .attr('class', 'd3-tip')
                .html(function(d) {
                    let value = that.g.node(d);
                    let htmlStr = '<h5>Name: <span style="color:#359f89">' + value.toolTiplabel + '</span></h5> ';
                    if (value.queryText) {
                        htmlStr += '<h5>Query: <span style="color:#359f89">' + value.queryText + '</span></h5> ';
                    }
                    return htmlStr;
                });
            svg.call(zoom)
                .call(tooltip);
            this.jqueryNativeElement.find('.fontLoader').hide();
            render(svgGroup, this.g);
            svg.on('dblclick.zoom', null)
                .on('wheel.zoom', null);
            // change text postion
            svgGroup.selectAll('g.nodes g.label')
                .attr('transform', 'translate(2,-30)');

            svgGroup.selectAll('g.nodes image')
                .on('mouseover', function(d) {
                    tooltip.show(d);
                })
                .on('dblclick', function(d) {
                    tooltip.hide(d);
                    // let urlForTab = window.location.hash.split('/')[1];

                    // Utils.setUrl({
                    //     url: '#!/detailPage/' + d,
                    //     mergeBrowserUrl: false,
                    //     trigger: true
                    // });
                })
                .on('mouseout', function(d) {
                    tooltip.hide(d);
                });
            // Center the graph
            let initialScale = 1.2;
            zoom.translate([(this.jqueryNativeElement.find('svg').width() - this.g.graph().width * initialScale) / 2, (this.jqueryNativeElement.find('svg').height() - this.g.graph().height * initialScale) / 2])
                .scale(initialScale)
                .event(svg);
            // svg.attr('height', this.g.graph().height * initialScale + 40);
        }
    }

    ngAfterViewInit() {
        this.createGraph(this.edgesAndvertices, this.startingPoint);
    }
}
