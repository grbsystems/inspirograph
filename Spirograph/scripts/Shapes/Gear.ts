/// <reference path='../definitions/references.d.ts' />
'use strict';

module Spirograph.Shapes {
    export function Gear(options: GearOptions) {
        if (!options.toothHeight) {
            options.toothHeight = 10;
        }
        if (!options.holeRadius) {
            options.holeRadius = 5;
        }
        if (!options.holeSweepAngle) {
            options.holeSweepAngle = 720;
        }

        // fudge factor, because something is wrong with my algorithm for determining how far apart each hole should be
        options.holeSweepAngle *= .78

        var outerRadius = options.radius + options.toothHeight,
            pathBuilder = new SVG.PathBuilder(),
            angle = 0,
            delta = 360 / options.toothCount;

        // draw the circle with teeth
        pathBuilder.add(new SVG.MCommand(options.radius, 0));
        for (var i = 0; i < options.toothCount; i++) {
            pathBuilder.add(new SVG.ACommand(options.radius, options.radius, 0, false, true, options.radius * Math.cos(Utility.toRadians(angle + delta * 1 / 3)), options.radius * Math.sin(Utility.toRadians(angle + delta * 1 / 3))));
            pathBuilder.add(new SVG.LCommand(outerRadius * Math.cos(Utility.toRadians(angle + delta * 1 / 2)), outerRadius * Math.sin(Utility.toRadians(angle + delta * 1 / 2))));
            pathBuilder.add(new SVG.ACommand(outerRadius, outerRadius, 0, false, true, outerRadius * Math.cos(Utility.toRadians(angle + delta * 5 / 6)), outerRadius * Math.sin(Utility.toRadians(angle + delta * 5 / 6))));
            pathBuilder.add(new SVG.LCommand(options.radius * Math.cos(Utility.toRadians(angle + delta)), options.radius * Math.sin(Utility.toRadians(angle + delta))));
            angle += delta;
        }

        pathBuilder.add(new SVG.ZCommand());

        var holePositionRadiusBuffer = 20,
            holePositionRadiusDelta = (options.radius - 2 * holePositionRadiusBuffer) / options.holeCount,
            holeAngle = 0,
            holePositionRadius = options.radius - holePositionRadiusBuffer;

        // finds the average change in arc length that will be needed to evenly space the hole
        // a purely angle-based change results in the hole being wide apart at the edges of the gear and
        // scruntched near the center.
        // this assumes that the arc length decreases linearly, which is probably not right.  See the fudge factor above.
        var smallestArcLength = Math.PI * (2 * holePositionRadiusBuffer) * ((options.holeSweepAngle / options.holeCount) / 360);
        var largestArcLength = Math.PI * (2 *(options.radius - holePositionRadiusBuffer)) * ((options.holeSweepAngle / options.holeCount) / 360);
        // average the smallest and largest arc lengths
        var holeArcLengthDelta = (smallestArcLength + largestArcLength) / 2;

        // cut out the holes
        for (var i = 0; i < options.holeCount; i++) {
            var holePosition = { x: holePositionRadius * Math.cos(Utility.toRadians(holeAngle)), y: holePositionRadius * Math.sin(Utility.toRadians(holeAngle)) };
            
            pathBuilder.add(new SVG.MCommand(holePosition.x + options.holeRadius, holePosition.y));
            pathBuilder.add(new SVG.ACommand(options.holeRadius, options.holeRadius, 0, true, false, holePosition.x - options.holeRadius, holePosition.y));
            pathBuilder.add(new SVG.ACommand(options.holeRadius, options.holeRadius, 0, true, false, holePosition.x + options.holeRadius, holePosition.y));

            holePositionRadius -= holePositionRadiusDelta;
            holeAngle += 360 * (holeArcLengthDelta / (Math.PI * 2 * holePositionRadius));
        }

        pathBuilder.add(new SVG.ZCommand());

        return pathBuilder.toString();
    }

    export interface GearOptions {
        // the radius of gear, NOT including the additional height of the teeth
        radius: number;
        // how tall each tooth should be
        toothHeight?: number;
        // how many teeth to draw on the gear
        toothCount: number;
        // how large each hole should be
        holeRadius?: number;
        // how many degrees to rotate while positioning the holes
        holeSweepAngle?: number;
        // how many holes to cut out of the gear
        holeCount: number;
    }
}