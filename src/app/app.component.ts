import { Component } from '@angular/core';
declare const sigma: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  nodesCount = 0;
  edgesCount = 0;
  sigma: any = {};
  selectedNode: any;

  search(e) {
    this.highlightTag(e.target.value);
  }

  private easing(k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k;
    }

    return - 0.5 * (--k * (k - 2) - 1);
  };

  private highlightTag(search, duration = 500) {
    if (search === '') {
      this.resetCamera();
      return;
    }

    // see https://github.com/jacomyal/sigma.js/issues/470
    // if (scope.highlightedTag) {
    //   var prevN = scope.s.graph.nodes(scope.highlightedTag);
    //   scope.s.renderers[0].dispatchEvent('outNode', {node:prevN});
    // }
    var n = this.selectedNode = this.sigma.graph.nodes(search);
    if (!n){
      this.resetCamera();
      return;
    }

    // scope.s.renderers[0].dispatchEvent('overNode', {node:n});
    sigma.misc.animation.camera(
      this.sigma.camera,
      {
        x:     n[this.sigma.camera.readPrefix + 'x'],
        y:     n[this.sigma.camera.readPrefix + 'y'],
        ratio: Math.min(0.2, this.sigma.camera.ratio)
      },
      {
        duration: 500,
        easing: this.easing
      }
    );
  };

  private resetCamera() {
    sigma.misc.animation.camera(
      this.sigma.camera,
      {
        x:     0,
        y:     0,
        ratio: 1.2
      },
      {
        duration: 500,
        easing: this.easing
      }
    );
  };

  ngOnInit() {
    const _self = this;

    // consider using https://stackoverflow.com/questions/56733805/how-to-install-and-use-sigmajs-in-angular-7-and-how-to-use-startforceatlas2-pack
    var scope: any = {};

    sigma.canvas.edges.def = function (edge, source, target, context, settings) {
      var prefix = settings('prefix') || '';
      context.strokeStyle = '#e0e0e0';
      context.lineWidth = 0.3;
      context.beginPath();
      context.moveTo(
        source[prefix + 'x'],
        source[prefix + 'y']
      );
      context.quadraticCurveTo(
        (source[prefix + 'x'] + target[prefix + 'x']) / 2 +
        (target[prefix + 'y'] - source[prefix + 'y']) / 4,
        (source[prefix + 'y'] + target[prefix + 'y']) / 2 +
        (source[prefix + 'x'] - target[prefix + 'x']) / 4,
        target[prefix + 'x'],
        target[prefix + 'y']
      );
      context.stroke();
    };

    _self.sigma = new sigma({
      container: 'graph',
      settings:  {
        doubleClickEnabled: true,
        // edgesPowRatio: 1
      },
      renderer: {
        container: document.getElementById('graph'),
        type: 'canvas'
      },
    });

    sigma.parsers.gexf(
      'assets/sigma/full_layouted.gexf',
      _self.sigma,
      function() {
        _self.nodesCount = _self.sigma.graph.nodes().length;
        _self.edgesCount = _self.sigma.graph.edges().length;
        _self.sigma.bind('clickNode', function(e) {
          var tagName = e.data.node.label;
          _self.highlightTag(tagName);
        });
        _self.sigma.refresh();
        _self.resetCamera();

        // _self.sigma.graph.nodes().forEach(function(n) {
        //   var color = Settings.getTagColor(n.label);
        //   if (!color) {
        //     Settings.setTagColor(n.label, n.color);
        //   } else {
        //     n.color = color.bg;
        //   }
        //   $rootScope.$apply();

        //   // TODO remove obsolete colors from settings
        // });
      }
    );

    // scope.$watch('reload', function(reload) {
    //   if (reload) {
    //     scope.renderGraph();
    //     scope.reload = false;
    //   }
    // });

    // scope.$watch('highlight', function(highlight) {
    //   if (!highlight) {
    //     scope.resetCamera();
    //   } else {
    //     _self.highlightTag(highlight);
    //   }
    // });
  }
}
