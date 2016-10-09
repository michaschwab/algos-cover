

angular.module('algoApp', [])
    .controller('IntervalCoverController', function($scope) {

        var me = this;

        $scope.intervals = [];

        me.init = function()
        {
            $scope.createNewRandom();
        };

        $scope.createNewRandom = function()
        {
            me.prepareIntervals();
            $scope.updateResults();
        };

        $scope.createNewSpecific = function()
        {
            var inputString = $scope.userIntervals.replace(/\s+/g, '');
            var intervals = inputString.split(';');
            $scope.intervals = [];

            intervals.forEach(function(intervalString)
            {
                var interval = {};
                var stringParts = intervalString.split('-');
                interval.start = parseFloat(stringParts[0]);
                interval.end = parseFloat(stringParts[1]);

                if(!isNaN(interval.start) && !isNaN(interval.end))
                    $scope.intervals.push(interval);
            });

            $scope.updateResults();
        };

        $scope.updateResults = function()
        {
            $scope.maxCoverage = me.computeCoverage($scope.intervals);
            $scope.schwabCover = me.schwabAlgo();
            $scope.schwabCoverage = me.computeCoverage($scope.schwabCover);

            me.markWhichOnesInSchwabCover();
        };

        me.schwabAlgo = function()
        {
            var cover = [];
            var intervalsSorted = me.sortIntervals($scope.intervals);

            for(var k = 0; k < intervalsSorted.length; k++)
            {
                if(me.addsToCoverage(cover, intervalsSorted[k]))
                {
                    cover.push(intervalsSorted[k]);
                }
            }

            for(var j = 0; j < cover.length; j++)
            {
                var interval = cover[j];

                var coverWithout = angular.copy(cover).filter(function(c) { return !me.isSameInterval(c, interval) && !c.isRemoved; });
                if(!me.addsToCoverage(coverWithout, interval))
                {
                    interval.isRemoved = true;
                }
            }

            return cover.filter(function(c) { return !c.isRemoved; });
        };

        me.sortIntervals = function(intervals)
        {
            return angular.copy(intervals).sort(function(i1, i2)
            {
                return i1.start-i2.start;
            });
        };

        me.addsToCoverage = function(cover, interval)
        {
            var coverage1 = me.computeCoverage(cover);
            var coverage2 = me.computeCoverage(cover.concat(interval));

            return coverage2 > coverage1;
        };

        me.computeCoverage = function(cover)
        {
            var intervalsSorted = me.sortIntervals(cover);
            var coverage = 0;
            var lastEnd = 0;

            for(var k = 0; k < intervalsSorted.length; k++)
            {
                var interval = intervalsSorted[k];

                if(interval.end < 0 || interval.start > 1) continue;

                if(interval.start < lastEnd)
                {
                    interval.start = lastEnd;
                }
                if(interval.end > 1)
                {
                    interval.end = 1;
                }

                var diff = interval.end - interval.start;

                if(diff < 0) continue;

                lastEnd = interval.end;
                coverage += diff;
            }

            return coverage;
        };

        me.prepareIntervals = function()
        {
            $scope.intervals = [];
            var countIntervals = Math.round(Math.random() * 5) + 1;
            for(var i = 0; i < countIntervals; i++)
            {
                $scope.intervals.push(me.makeRandomInterval());
            }
/*
            $scope.intervals = [];
            $scope.intervals.push({start:  0.459, end: 0.954});
            $scope.intervals.push({start:  0.108, end: 0.566});
            $scope.intervals.push({start: -0.185, end: 0.178});
            $scope.intervals.push({start:  0.238, end: 0.939});
            $scope.intervals.push({start:  0.581, end: 1.061});
            $scope.intervals.push({start:  0.913, end: 1.120});*/
        };

        me.makeRandomInterval = function()
        {
            var min = -0.2;
            var max = 1.2;

            var diff = max - min;
            var rand1 = Math.random();
            var rand2 = Math.random();

            if(rand2 < rand1)
            {
                // swap
                var temp = rand2;
                rand2 = rand1;
                rand1 = temp;
            }

            var start = diff * rand1 + min;
            var end = diff * rand2 + min;

            return {start: start, end: end};
        };

        me.isSameInterval = function(i1, i2)
        {
            if(Math.round((i1.start - i2.start) * 100) == 0)
            {
                if(Math.round((i1.end - i2.end) * 100) == 0)
                {
                    return true;
                }
            }
            return false;
        };

        me.markWhichOnesInSchwabCover = function()
        {
            for(var j = 0; j < $scope.intervals.length; j++)
            {
                var inSchwabCover = false;

                for(var k = 0; k < $scope.schwabCover.length; k++)
                {
                    if(me.isSameInterval($scope.schwabCover[k], $scope.intervals[j]))
                    {
                        inSchwabCover = true;
                    }
                }

                $scope.intervals[j].inSchwabCover = inSchwabCover;
            }
        };

        me.init();

    });