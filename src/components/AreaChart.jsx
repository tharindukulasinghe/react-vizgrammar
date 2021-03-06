/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { VictoryArea, VictoryStack, VictoryTooltip, VictoryScatter, VictoryGroup } from 'victory';
import { timeFormat } from 'd3';
import _ from 'lodash';
import BaseChart from './BaseChart';
import ChartContainer from './ChartContainer';
import LegendComponent from './LegendComponent';
import darkTheme from './resources/themes/victoryDarkTheme';
import lightTheme from './resources/themes/victoryLightTheme';

/**
 * Class to handle visualization of Area Charts.
 */
export default class AreaChart extends BaseChart {

    constructor(props) {
        super(props);
        this.handleMouseEvent = this.handleMouseEvent.bind(this);
        this.handleLegendInteraction = this.handleLegendInteraction.bind(this);
    }

    /**
     * Generate the chart components in the case where there's only Area charts defined in the chart config.
     * @param {Array} chartArray - Array containing objects that has the information to visualize each area chart.
     * @param {String} xScale - xAxis scale to be used in the charts.
     * @param {Object} dataSets - object containing arrays of data after classification.
     * @param {Object} config - object containing user provided chart configuration
     * @param {Function} onClick - function to be executed on click event
     * @param {Array} ignoreArray - array that contains dataSets to be ignored in rendering the components.
     * @returns {{chartComponents: Array, legendComponents: Array}}
     */
    static getAreaChartComponent(chartArray, xScale, dataSets, config, onClick, ignoreArray, currentTheme) {
        const chartComponents = [];
        const legendComponents = [];

        chartArray.forEach((chart, chartIndex) => {
            const localChartComp = [];
            _.keys(chart.dataSetNames).forEach((dsName) => {
                legendComponents.push({
                    name: dsName,
                    symbol: { fill: _.indexOf(ignoreArray, dsName) > -1 ? '#d3d3d3' : chart.dataSetNames[dsName] },
                    chartIndex,
                });
                if (_.indexOf(ignoreArray, dsName) === -1) {
                    localChartComp.push(
                        AreaChart
                            .getComponent(config, chartIndex, xScale, dataSets[dsName],
                                chart.dataSetNames[dsName], onClick, currentTheme));
                }
            });

            if (chart.mode === 'stacked') {
                chartComponents.push((
                    <VictoryStack key={`area-group-${chart.id}`} >
                        {localChartComp}
                    </VictoryStack>
                ));
            } else {
                chartComponents.push(...localChartComp);
            }
        });
        return { chartComponents, legendComponents };
    }

    /**
     * Generate a single Area chart component to be visualized.
     * @param {Object} config - Chart configuration provided by the user.
     * @param {Number} chartIndex - Index of the chart definition in the chart Array.
     * @param {String} xScale - Scale to be used in the xAxis when plotting the chart.
     * @param {Array} data - Array of objects that containing the dataset to be plotted using this chart component.
     * @param {String} color - Color the chart should be plotted in.
     * @param {Function} onClick - Function to be executed in the case of an click event.
     * @returns {Element}
     */
    static getComponent(config, chartIndex, xScale, data, color, onClick, currentTheme) {
        return (
            <VictoryGroup
                key={`area-group-${chartIndex}`}
                data={data}
                color={color}
            >
                <VictoryArea
                    style={{
                        data: {
                            fillOpacity: config.charts[chartIndex].style ?
                                config.charts[chartIndex].style.fillOpacity || currentTheme.area.style.data.fillOpacity
                                : currentTheme.area.style.data.fillOpacity,
                        },
                    }}
                    name="blacked"
                    animate={config.animate ? { onEnter: { duration: 50 } } : null}
                />
                <VictoryScatter
                    labels={
                        (() => {
                            if (xScale === 'time' && config.tipTimeFormat) {
                                return (d) => {
                                    if (Number(d.y) == Number(d.y).toFixed(2)) {
                                        return `${config.x} : ${timeFormat(config.tipTimeFormat)(new Date(d.x))}\n` +
                                            `${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                    }
                                    else {
                                        return `${config.x} : ${timeFormat(config.tipTimeFormat)(new Date(d.x))}\n` +
                                            `${config.charts[chartIndex].y} : ${Number(d.y).toFixed(2)}`;
                                    }
                                };
                            } else {
                                return (d) => {
                                    if (isNaN(d.x)) {
                                        if (Number(d.y) == Number(d.y).toFixed(2)) {
                                            return `${config.x} : ${d.x}\n${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                        } else {
                                            return `${config.x} : ${d.x}\n${config.charts[chartIndex].y} : ${Number(d.y)
                                                .toFixed(2)}`;
                                        }
                                    } else {
                                        if (Number(d.y) == Number(d.y).toFixed(2) && Number(d.x) == Number(d.x).toFixed(2)) {
                                            return `${config.x} : ${Number(d.x)}\n` +
                                                `${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                        } else if (Number(d.y) == Number(d.y).toFixed(2)) {
                                            return `${config.x} : ${Number(d.x).toFixed(2)}\n` +
                                                `${config.charts[chartIndex].y} : ${Number(d.y)}`;
                                        } else if (Number(d.x) == Number(d.x).toFixed(2)) {
                                            return `${config.x} : ${Number(d.x)}\n` +
                                                `${config.charts[chartIndex].y} : ${Number(d.y).toFixed(2)}`;
                                        } else {
                                            return `${config.x} : ${Number(d.x).toFixed(2)}\n` +
                                                `${config.charts[chartIndex].y} : ${Number(d.y).toFixed(2)}`;
                                        }
                                    }
                                };
                            }
                        })()
                    }
                    labelComponent={
                        <VictoryTooltip
                            pointerLength={4}
                            cornerRadius={2}
                            flyoutStyle={{
                                fill: currentTheme.tooltip.style.flyout.fill,
                                fillOpacity: currentTheme.tooltip.style.flyout.fillOpacity,
                                strokeWidth: currentTheme.tooltip.style.flyout.strokeWidth
                            }}
                            style={{ fill: currentTheme.tooltip.style.labels.fill }}
                        />
                    }
                    size={(
                        config.charts[chartIndex].style ?
                            config.charts[chartIndex].style.markRadius || currentTheme.area.style.data.markRadius :
                            currentTheme.area.style.data.markRadius
                    )}
                    animate={config.animate ? { onEnter: { duration: 50 } } : null}
                    events={[{
                        target: 'data',
                        eventHandlers: {
                            onClick: () => {
                                return [{ target: 'data', mutation: onClick }];
                            },
                        },
                    }]}
                />
            </VictoryGroup>
        );
    }

    render() {
        const { config, height, width, yDomain, theme } = this.props;
        const { chartArray, dataSets, xScale, ignoreArray } = this.state;
        const currentTheme = theme === 'light' ? lightTheme : darkTheme;

        const { chartComponents, legendComponents } =
            AreaChart.getAreaChartComponent(chartArray, xScale, dataSets, config, this.handleMouseEvent, ignoreArray,
                currentTheme);

        return (
            <ChartContainer
                width={width}
                height={height}
                xScale={xScale}
                config={config}
                yDomain={yDomain}
                theme={theme}
            >
                {
                    config.legend === true ?
                        <LegendComponent
                            height={height}
                            width={width}
                            legendItems={legendComponents}
                            interaction={this.handleLegendInteraction}
                            config={config}
                        /> : null

                }
                {chartComponents}
            </ChartContainer>
        );
    }
}
