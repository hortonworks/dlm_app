mapa = new Datamap({
            element: document.getElementById('mapBackupPolicy'),
            projection: 'mercator',
            height: 295,
            width: 385,
            fills: {
                defaultFill: '#ABE3F3',
            },
            bubblesConfig: {
                popupTemplate: function(geography, data) {
                    return '<div class="hoverinfo">' + data.location +'</div>';
                },
                borderWidth: '2',
                borderColor: '#FFFFFF',
            },
            setProjection: function(element, options) {
                var projection, path;
                projection = d3.geo.mercator()
                    .center([120, 90])
                    .scale(2)
                    .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
                path = d3.geo.path()
                    .projection( projection );
                console.log('element', element);
                console.log('bubles:', this.bubbles);
                debugger;
                
                return {path: path, projection: projection};
            }
        });