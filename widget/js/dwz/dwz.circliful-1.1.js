/**
 * circliful v 1.1
 * https://github.com/pguso/jquery-plugin-circliful
 * http://fontawesome.io/icons/     #没有用到这个font-face库
 * http://zavoloklom.github.io/material-design-iconic-font/icons.html   #使用的是这个font-face库
 */

(function ($) {

    $.fn.circliful = function (options, callback) {

        var settings = $.extend({
            // These are the defaults.
            foregroundColor: "#3498DB",
            backgroundColor: "#ccc",
            pointSize: 28.5,
            pointColor: "none",
            pointBorderWidth: 0,
            fillColor: 'none',
            foregroundBorderWidth: 15,
            backgroundBorderWidth: 15,
            fontColor: '#aaa',
            percent: 75,
            animation: 1,
            animationStep: 5,
            icon: 'none',
            iconSize: '30',
            iconColor: '#ccc',
            iconPosition: 'top',
            target: 0,
            start: 0,
            showPercent: 1,
            percentageTextSize: 22,
            percentageX: 100,
            percentageY: 113,
            textAdditionalCss: '',
            targetPercent: 0,
            targetTextSize: 17,
            targetColor: '#2980B9',
            text: null,
            textStyle: null,
            textColor: '#666',
            textY: null,
            textX: null,
            multiPercentage: 0,
            percentages: [],
            multiPercentageLegend: 0,
            textBelow: false,
            noPercentageSign: false,
            replacePercentageByText: null,
            halfCircle: false,
            decimals: 0,
            alwaysDecimals: false,
            title: 'Circle Chart',
            progressColor: null
        }, options);

        return this.each(function () {
            var circleContainer = $(this);
            mergeDataAttributes(settings, circleContainer.data());

            var percent = settings.percent;
            var iconY = 83;
            var iconX = 100;
            var percentageY = settings.percentageY;
            var percentageX = settings.percentageX;
            var elements;
            var icon = '';
            var backgroundBorderWidth = settings.backgroundBorderWidth;
            var progressColor = settings.progressColor

            if (settings.halfCircle) {
                if (settings.iconPosition === 'left') {
                    iconX = 80;
                    iconY = 100;
                    percentageX = 117;
                    percentageY = 100;
                } else if (settings.halfCircle) {
                    iconY = 80;
                    percentageY = 100;
                }
            } else {
                if (settings.iconPosition === 'bottom') {
                    iconY = 124;
                    percentageY = 95;
                } else if (settings.iconPosition === 'left') {
                    iconX = 80;
                    iconY = 110;
                    percentageX = 117;
                } else if (settings.iconPosition === 'middle') {
                    if (settings.multiPercentage !== 1) {
                        elements = '<g stroke="' + (settings.backgroundColor !== 'none' ? settings.backgroundColor : '#ccc') + '" ><line x1="133" y1="50" x2="140" y2="40" stroke-width="2"  /></g>';
                        elements += '<g stroke="' + (settings.backgroundColor !== 'none' ? settings.backgroundColor : '#ccc') + '" ><line x1="140" y1="40" x2="200" y2="40" stroke-width="2"  /></g>';
                        percentageX = 170; // To center the percentage exactly in the center.
                        percentageY = 35;
                    }
                    iconY = 110;
                } else if (settings.iconPosition === 'right') {
                    iconX = 120;
                    iconY = 110;
                    percentageX = 80;
                } else if (settings.iconPosition === 'top' && settings.icon !== 'none') {
                    percentageY = 120;
                }
            }

            if (settings.targetPercent > 0 && settings.halfCircle !== true) {
                percentageY = 95;
                elements = '<g stroke="' + (settings.backgroundColor !== 'none' ? settings.backgroundColor : '#ccc') + '" ><line x1="75" y1="101" x2="125" y2="101" stroke-width="1"  /></g>';
                elements += '<text text-anchor="middle" x="' + percentageX + '" y="120" style="font-size: ' + settings.targetTextSize + 'px;" fill="' + settings.targetColor + '">' + settings.targetPercent + (settings.noPercentageSign && settings.replacePercentageByText === null ? '' : '%') + '</text>';
                elements += '<circle cx="100" cy="100" r="69" fill="none" stroke="' + settings.backgroundColor + '" stroke-width="3" stroke-dasharray="450" transform="rotate(-90,100,100)" />';
                elements += '<circle cx="100" cy="100" r="69" fill="none" stroke="' + settings.targetColor + '" stroke-width="3" stroke-dasharray="' + (435 / 100 * settings.targetPercent) + ', 20000" transform="rotate(-90,100,100)" />';
            }

            if (settings.text !== null) {
                if (settings.halfCircle) {
                    if (settings.textBelow) {
                        elements += '<text text-anchor="middle" x="' + (settings.textX !== null ? settings.textX : '100') + '" y="' + (settings.textY !== null ? settings.textY : '64%') + '" style="' + settings.textStyle + '" fill="' + settings.textColor + '">' + settings.text + '</text>';
                    }
                    else {
                        elements += '<text text-anchor="middle" x="' + (settings.textX !== null ? settings.textX : '100' ) + '" y="' + (settings.textY !== null ? settings.textY : '115') + '" style="' + settings.textStyle + '" fill="' + settings.textColor + '">' + settings.text + '</text>';
                    }
                } else {
                    if (settings.textBelow) {
                        elements += '<text text-anchor="middle" x="' + (settings.textX !== null ? settings.textX : '100' ) + '" y="' + (settings.textY !== null ? settings.textY : '99%') + '" style="' + settings.textStyle + '" fill="' + settings.textColor + '">' + settings.text + '</text>';
                    }
                    else {
                        elements += '<text text-anchor="middle" x="' + (settings.textX !== null ? settings.textX : '100' ) + '" y="' + (settings.textY !== null ? settings.textY : '115') + '" style="' + settings.textStyle + '" fill="' + settings.textColor + '">' + settings.text + '</text>';
                    }
                }
            }

            if (settings.icon !== 'none') {

                // 图标iconSize大小适配：默认按照iconSize:30居中
                settings.iconSize = parseInt(settings.iconSize);
                iconX += (settings.iconSize - 30) / 5;
                iconY += (settings.iconSize - 30) / 5;

                icon = '<text text-anchor="middle" x="' + iconX + '" y="' + iconY + '" class="icon" style="font-size: ' + settings.iconSize + 'px" fill="' + settings.iconColor + '">&#x' + settings.icon + '</text>';
                // icon = '<image x="' + iconX + '" y="' + iconY + '" width="' + settings.iconSize + '" fill="' + settings.iconColor + '" xlink:href="'+settings.icon+'"/>';
            }

            if (settings.halfCircle) {
                var rotate = 'transform="rotate(-180,100,100)"';
                circleContainer
                    .addClass('svg-container')
                    .append(
                        $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 194 186" class="circliful">' +
                            (typeof elements !== 'undefined' ? elements : '') +
                            '<clipPath id="cut-off-bottom"> <rect x="100" y="0" width="100" height="200" /> </clipPath>' +
                            '<circle cx="100" cy="100" r="57" class="border" fill="' + settings.fillColor + '" stroke="' + settings.backgroundColor + '" stroke-width="' + backgroundBorderWidth + '" stroke-dasharray="360" clip-path="url(#cut-off-bottom)" transform="rotate(-90,100,100)" />' +
                            '<circle class="circle" cx="100" cy="100" r="57" class="border" fill="none" stroke="' + settings.foregroundColor + '" stroke-width="' + settings.foregroundBorderWidth + '" stroke-dasharray="0,20000" ' + rotate + ' />' +
                            '<circle cx="100" cy="100" r="' + settings.pointSize + '" fill="' + settings.pointColor + '" stroke="' + settings.backgroundColor + '" stroke-width="' + settings.pointBorderWidth + '" clip-path="url(#cut-off-bottom)" transform="rotate(-90,100,100)" />' +
                            icon +
                            '<text class="timer" text-anchor="middle" x="' + percentageX + '" y="' + percentageY + '" style="font-size: ' + settings.percentageTextSize + 'px; ' + settings.textAdditionalCss + '" fill="' + settings.fontColor + '"><tspan class="number">' + (settings.replacePercentageByText === null ? 0 : settings.replacePercentageByText) + '</tspan><tspan class="percent">' + (settings.noPercentageSign || settings.replacePercentageByText !== null ? '' : '%') + '</tspan></text>')
                    );
            } else {
                drawCircles();
            }

            var circle = circleContainer.find('.circle');
            var myTimer = circleContainer.find('.timer');
            var interval = 30;
            var angle = 0;
            var angleIncrement = settings.animationStep;
            var last = 0;
            var summary = 0;
            var oneStep = 0;
            var text = percent;
            var calculateFill = (360 / 100 * percent);

            if (settings.halfCircle) {
                calculateFill = (360 / 100 * percent) / 2;
            }

            if (settings.replacePercentageByText !== null) {
                text = settings.replacePercentageByText;
            }

            if (settings.start > 0 && settings.target > 0) {
                percent = settings.start / (settings.target / 100);
                oneStep = settings.target / 100;
            }

            if (settings.animation === 1) {
                animate();
            } else {
                if (settings.multiPercentage !== 1) {
                    circle
                        .attr("stroke-dasharray", calculateFill + ", 20000");

                    if (settings.showPercent === 1) {
                        myTimer
                            .find('.number')
                            .text(text);
                    } else {
                        myTimer
                            .find('.number')
                            .text(settings.target);
                        myTimer
                            .find('.percent')
                            .text('');
                    }
                } else {
                    if (settings.replacePercentageByText !== null) {
                        myTimer
                            .find('.number')
                            .text(settings.replacePercentageByText);
                        myTimer
                            .find('.percent')
                            .text('');
                    }
                }
            }

            function animate() {
                var currentCircle = circle;
                var currentCalculateFill = calculateFill;

                if (settings.multiPercentage === 1) {
                    var index, percent;
                    var percentages = settings.percentages;
                    var circleRadius = 360;
                    for (index = 0; index < percentages.length; ++index) {
                        percent = percentages[index].percent;
                        currentCalculateFill = (circleRadius / 100 * percent);
                        currentCircle = circleContainer.find('#circle' + (index + 1));

                        if (index > 0) {
                            circleRadius = circleRadius + 62.5;
                            currentCalculateFill = (circleRadius / 100 * percent);
                        }

                        animateCircle(currentCircle, currentCalculateFill, circleRadius, percent);
                    }
                } else {
                    animateCircle(currentCircle, currentCalculateFill, 360, percent);
                }
            }

            function animateCircle(currentCircle, currentCalculateFill, circleRadius, percent) {
                var timer = window.setInterval(function () {
                    if ((angle) >= currentCalculateFill) {
                        window.clearInterval(timer);
                        last = 1;
                        if (typeof callback === 'function') {
                            callback.call(this);
                        }
                    } else {
                        angle += angleIncrement;
                        summary += oneStep;
                    }
                    if (settings.halfCircle) {
                        if (angle * 2 / (circleRadius / 100) >= percent && last === 1) {
                            angle = ((circleRadius / 100) * percent) / 2
                        }
                    } else {
                        if (angle / (circleRadius / 100) >= percent && last === 1) {
                            angle = (circleRadius / 100) * percent;
                        }
                    }

                    if (summary > settings.target && last === 1) {
                        summary = settings.target;
                    }

                    if (settings.replacePercentageByText === null) {
                        if (settings.halfCircle) {
                            text = parseFloat((100 * angle / circleRadius) * 2);
                        } else {
                            text = parseFloat((100 * angle / circleRadius));
                        }
                        text = text.toFixed(settings.decimals);
                        if (!settings.alwaysDecimals && (percent === 0 || (percent > 1 && last !== 1))) {
                            text = parseInt(text);
                        }
                    }

                    currentCircle
                        .attr("stroke-dasharray", angle + ", 20000");

                    if (settings.multiPercentage !== 1) {
                        if (settings.showPercent === 1) {
                            myTimer
                                .find('.number')
                                .text(text);
                        } else {

                            myTimer
                                .find('.number')
                                .text(summary);
                            myTimer
                                .find('.percent')
                                .text('');
                        }
                    } else {
                        myTimer
                            .find('.number')
                            .text('');
                        myTimer
                            .find('.percent')
                            .text('');
                    }

                    if (progressColor !== null) {
                        $.each(progressColor, function (key, color) {
                            if (settings.halfCircle) {
                                key /= 2
                            }
                            if (angle >= key * (circleRadius / 100)) {
                                currentCircle.css({
                                    stroke: color,
                                    transition: 'stroke 0.1s linear'
                                });
                            }
                        });
                    }
                }.bind(currentCircle), interval);
            }

            function isElementInViewport() {
                // Get the scroll position of the page.
                var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') !== -1) ? 'body' : 'html');
                var viewportTop = $(scrollElem).scrollTop();
                var viewportBottom = viewportTop + $(window).height();

                // Get the position of the element on the page.
                var elemTop = Math.round(circle.offset().top);
                var elemBottom = elemTop + circle.height();

                return ((elemTop < viewportBottom) && (elemBottom > viewportTop));
            }

            function mergeDataAttributes(settings, dataAttributes) {
                for (var key in settings) {
                    if (key in dataAttributes) {
                        settings[key] = dataAttributes[key];
                    }
                }
            }

            /**
             * Draws the initial circles before animate gets called
             */
            function drawCircles() {
                if (settings.multiPercentage === 1) {
                    var index, calculateFillMulti, percent, color, circles;
                    var percentages = settings.percentages;
                    var radius = 47;
                    var circleRadius = 360;
                    var rotate = -90;
                    for (index = 0; index < percentages.length; ++index) {
                        percent = percentages[index].percent;
                        color = percentages[index].color;
                        calculateFillMulti = (circleRadius / 100 * percent);
                        if (index > 0) {
                            circleRadius = circleRadius + 62.5;
                            calculateFillMulti = (circleRadius / 100 * percent);
                        }
                        radius += 10;
                        circles += '<circle cx="100" cy="100" r="' + radius + '" class="border" fill="' + settings.fillColor + '" stroke="' + settings.backgroundColor + '" stroke-width="' + backgroundBorderWidth + '" stroke-dasharray="' + circleRadius + '" transform="rotate(' + rotate + ',100,100)" />' +
                            '<circle class="circle" id="circle' + (index + 1) + '" data-percent="' + percent + '" cx="100" cy="100" r="' + radius + '" class="border" fill="none" stroke="' + color + '" stroke-width="' + settings.foregroundBorderWidth + '" stroke-dasharray="' + calculateFillMulti + ',20000" transform="rotate(' + rotate + ',100,100)" />';
                    }

                    circleContainer
                        .addClass('svg-container')
                        .append(
                            $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 194 186" class="circliful">' +
                                (typeof elements !== 'undefined' ? elements : '') +
                                circles +
                                icon +
                                '<text class="timer" text-anchor="middle" x="' + percentageX + '" y="' + percentageY + '" style="font-size: ' + settings.percentageTextSize + 'px; ' + settings.textAdditionalCss + '" fill="' + settings.fontColor + '">' +
                                '<tspan class="number">' + (settings.replacePercentageByText === null ? 0 : settings.replacePercentageByText) + '</tspan>' +
                                '<tspan class="percent">' + (settings.noPercentageSign || settings.replacePercentageByText !== null ? '' : '%') + '</tspan>' +
                                '</text>')
                        );

                    if (settings.multiPercentageLegend === 1) {
                        showLegend();
                    }
                } else {
                    circleContainer
                        .addClass('svg-container')
                        .append(
                            $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 194 186" class="circliful">' +
                                (typeof elements !== 'undefined' ? elements : '') +
                                '<circle cx="100" cy="100" r="57" class="border" fill="' + settings.fillColor + '" stroke="' + settings.backgroundColor + '" stroke-width="' + backgroundBorderWidth + '" stroke-dasharray="360" transform="rotate(-90,100,100)" />' +
                                '<circle class="circle" cx="100" cy="100" r="57" class="border" fill="none" stroke="' + settings.foregroundColor + '" stroke-width="' + settings.foregroundBorderWidth + '" stroke-dasharray="0,20000" transform="rotate(-90,100,100)" />' +
                                '<circle cx="100" cy="100" r="' + settings.pointSize + '" fill="' + settings.pointColor + '" stroke="' + settings.backgroundColor + '" stroke-width="' + settings.pointBorderWidth + '" />' +
                                icon +
                                '<text class="timer" text-anchor="middle" x="' + percentageX + '" y="' + percentageY + '" style="font-size: ' + settings.percentageTextSize + 'px; ' + settings.textAdditionalCss + '" fill="' + settings.fontColor + '">' +
                                '<tspan class="number">' + (settings.replacePercentageByText === null ? 0 : settings.replacePercentageByText) + '</tspan>' +
                                '<tspan class="percent">' + (settings.noPercentageSign || settings.replacePercentageByText !== null ? '' : '%') + '</tspan>' +
                                '</text>')
                        );
                }
            }

            /**
             * Show the legend only for multi percentage circles
             */
            function showLegend() {
                var height = circleContainer.height();
                var width = circleContainer.width();
                var percentages = settings.percentages;
                var index;
                var lines = '';
                for (index = 0; index < percentages.length; ++index) {
                    var title = percentages[index].title;
                    var color = percentages[index].color;
                    var percent = percentages[index].percent;

                    lines += '<div><span class="color-box" style="background: ' + color + '"></span>' + title + ', ' + percent + '%</div>';
                }

                circleContainer.append(
                    $('<div/>')
                        .append(lines)
                        .attr('style', 'position:absolute;top:' + height / 3 + 'px;left:' + (width + 20) + 'px')
                        .attr('class', 'legend-line')
                );
            }
        });
    }
}(dwz));
