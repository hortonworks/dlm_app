/**
 * TODO
 */

L.TileLayer.GeoJSON = L.TileLayer.extend({
    _geojson: {"type":"FeatureCollection","features":[]},
    _requests: [],
    geojson: function() {
        if (this._geojson.features.length) return this._geojson;
        for (k in this._tiles) {
            var t = this._tiles[k];
            if (t.geojson && t.geojson.features) {
                this._geojson.features =
                    this._geojson.features.concat(t.geojson.features);
            }
        }
        return this._geojson;
    },
    _addTile: function(tilePoint, container) {
        var tile = { geojson: null };
        this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;
        this._loadTile(tile, tilePoint);
    },
    _loadTile: function (tile, tilePoint) {
        var layer = this;
        this._requests.push(
          fetch(this.getTileUrl(tilePoint))
          .then(response => response.json())
          .then((geojson) => {
                tile.geojson = geojson;
                layer._geojson.features = [];
                layer._tileLoaded();
          })
          .catch(error => layer._tileLoaded())
        );
    },
    _resetCallback: function() {
        this._geojson.features = [];
        L.TileLayer.prototype._resetCallback.apply(this, arguments);
        for (i in this._requests) {
            this._requests[i].abort();
        }
        this._requests = [];
    },
    _update: function() {
        if (this._map._panTransition && this._map._panTransition._inProgress) { return; }
        L.TileLayer.prototype._update.apply(this, arguments);
    }
});
