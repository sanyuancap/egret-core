//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////


module egret {

    /**
     * @private
     */
    const enum Keys {
        scrollPolicyV,
        scrollPolicyH,
        autoHideTimer,
        touchStartX,
        touchStartY,
        touchMoved,
        horizontalCanScroll,
        verticalCanScroll,
        touchScrollH,
        touchScrollV,
        delayTouchTimer,
        delayTouchEvent,
        viewport
    }
    /**
     * @language en_US
     * ScrollView is an auxiliary class for sliding which passes a display object to the constructor function. In the specified size range, display objects beyond the range can be displayed. And they can be dragged randomly within this range.
     */
    /**
     * @language zh_CN
     * ScrollView 是用于滑动的辅助类，将一个显示对象传入构造函数即可。可以在指定的尺寸范围内显示超过该范围的显示对象。并可以在此范围内随意拖动。
     */
    export class ScrollView extends egret.DisplayObjectContainer {

        /**
         * @language en_US
         * The threshold value(in pixels) trigger the rolling.
         * when the touch points deviate from the initial touch point than this value will trigger the rolling.
         *
         * @default 5
         *
         */
        /**
         * @language zh_CN
         * 开始触发滚动的阈值（以像素为单位），当触摸点偏离初始触摸点的距离超过这个值时才会触发滚动。
         *
         * @default 5
         *
         */
        public static scrollThreshold:number = 5;

        /**
         * @language en_US
         * Constructor.
         *
         */
        /**
         * @language zh_CN
         * 构造函数。
         *
         */
        public constructor() {
            super();
            var touchScrollH = new sys.TouchScroll(this.horizontalUpdateHandler, this.horizontalEndHandler, this);
            var touchScrollV = new sys.TouchScroll(this.verticalUpdateHandler, this.verticalEndHanlder, this);
            this.$ScrollView = {
                0: "auto",          //scrollPolicyV,
                1: "auto",          //scrollPolicyH,
                2: null,            //autoHideTimer,
                3: 0,               //touchStartX,
                4: 0,               //touchStartY,
                5: false,           //touchMoved,
                6: false,           //horizontalCanScroll,
                7: false,           //verticalCanScroll,
                8: touchScrollH,    //touchScrollH,
                9: touchScrollV,    //touchScrollV
                10: null,           //delayTouchTimer,
                11: null,           //delayTouchEvent
                12: null           //viewport
            };

            this.touchEnabled = true;
        }

        /**
         * @private
         */
        $ScrollView:Object;

        /**
         * @language en_US
         * Display policy of vertical scrollbar, on/off/auto.
         * @default auto
         *
         */
        /**
         * @language zh_CN
         * 垂直滚动条显示策略，on/off/auto。
         * @default auto
         *
         */
        public get verticalScrollPolicy():string {
            return this.$ScrollView[Keys.scrollPolicyV];
        }

        public set verticalScrollPolicy(value:string) {
            this.$setVerticalScrollPolicy(value);
        }

        $setVerticalScrollPolicy(value:string):boolean {
            this.$ScrollView[Keys.scrollPolicyV] = value;
            return true;
        }

        $getVerticalScrollPolicy():string {
            return this.$ScrollView[Keys.scrollPolicyV];
        }

        /**
         * @language en_US
         * Display policy of horizontal scrollbar, on/off/auto.
         * @default auto
         */
        /**
         * @language zh_CN
         * 水平滚动条显示策略，on/off/auto。
         * @default auto
         */
        public get horizontalScrollPolicy():string {
            return this.$ScrollView[Keys.scrollPolicyH];
        }

        public set horizontalScrollPolicy(value:string) {
            this.$setHorizontalScrollPolicy(value);
        }

        $setHorizontalScrollPolicy(value:string):boolean {
            this.$ScrollView[Keys.scrollPolicyH] = value;
            return true;
        }

        $getHorizontalScrollPolicy():string {
            return this.$ScrollView[Keys.scrollPolicyH];
        }

        $getHorizontalCanScroll():boolean {
            return this.$ScrollView[Keys.horizontalCanScroll];
        }

        $getVerticalCanScroll():boolean {
            return this.$ScrollView[Keys.verticalCanScroll];
        }

        $checkScrollPolicy():boolean {
            var hpolicy = this.$ScrollView[Keys.scrollPolicyH];
            var hCanScroll = this.checkScrollPolicy2(hpolicy, this._getContentWidth(), this.width);
            this.$ScrollView[Keys.horizontalCanScroll] = hCanScroll;
            var vpolicy = this.$ScrollView[Keys.scrollPolicyV];
            var vCanScroll = this.checkScrollPolicy2(vpolicy, this._getContentHeight(), this.height);
            this.$ScrollView[Keys.verticalCanScroll] = vCanScroll;
            return hCanScroll || vCanScroll;
        }

        private checkScrollPolicy2(policy: string, contentLength, viewLength):boolean {
            if (policy == "on")
                return true;
            if (policy == "off")
                return false;
            return contentLength > viewLength;
        }

        $viewport:DisplayObject;
        public setContent(value: egret.DisplayObject): void {
            var values = this.$ScrollView;
            if (value == values[Keys.viewport])
                return;

            this.$uninstallViewport();
            values[Keys.viewport] = value;
            this.$viewport = value;

            this.$installViewport();
        }

        /**
         * @private
         * 安装并初始化视域组件
         */
        $installViewport():void {
            var viewport = this.$viewport;
            if (viewport) {
                this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBeginCapture, this, true);
                this.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEndCapture, this, true);
                super.addChildAt(viewport, 0);
            }
        }

        /**
         * @language en_US
         * Remove the scrolled object
         */
        /**
         * @language zh_CN
         * 移除滚动的对象
         */
        public removeContent():void {
            this.$uninstallViewport();
        }

        /**
         * @private
         * 卸载视域组件
         */
        $uninstallViewport():void {
            var viewport = this.$viewport;
            if (viewport && viewport.parent == this) {
                this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBeginCapture, this, true);
                this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEndCapture, this, true);
                super.removeChild(viewport);
            }
        }



        /**
         * @private
         * 
         * @param event 
         */
        private onTouchEndCapture(event:egret.TouchEvent):void {
            if (this.$ScrollView[Keys.delayTouchEvent]) {
                this.delayEmitEvent(event);
            }
        }

        /**
         * @private
         * 若这个Scroller可以滚动，阻止当前事件，延迟100ms再抛出。
         */
        private onTouchBeginCapture(event:egret.TouchEvent):void {
            var canScroll:boolean = this.checkScrollPolicy();
            if (!canScroll) {
                return;
            }

            var target:egret.DisplayObject = event.target;
            while (target != this) {
                if (target instanceof ScrollView) {
                    canScroll = (<ScrollView><any> target).checkScrollPolicy();
                    if (canScroll) {
                        return;
                    }
                }
                target = target.$parent;
            }
            this.delayEmitEvent(event);
            this.onTouchBegin(event);
        }

        /**
         * @private
         * 
         * @param event 
         */
        private delayEmitEvent(event:egret.TouchEvent):void {
            var values = this.$ScrollView;
            if (values[Keys.delayTouchEvent]) {
                this.onDelayTouchEventTimer();
            }
            event.stopPropagation();
            var touchEvent:egret.TouchEvent = egret.Event.create(egret.TouchEvent, event.$type, event.$bubbles, event.$cancelable);
            touchEvent.$setTo(event.$stageX, event.$stageY, event.touchPointID);
            touchEvent.$target = event.$target;
            values[Keys.delayTouchEvent] = touchEvent;
            if (!values[Keys.delayTouchTimer]) {
                values[Keys.delayTouchTimer] = new egret.Timer(100, 1);
                values[Keys.delayTouchTimer].addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.onDelayTouchEventTimer, this);
            }
            values[Keys.delayTouchTimer].start();
        }

        /**
         * @private
         * 
         * @param e 
         */
        private onDelayTouchEventTimer(e?:egret.TimerEvent):void {
            var values = this.$ScrollView;
            values[Keys.delayTouchTimer].stop();
            var event = values[Keys.delayTouchEvent];
            values[Keys.delayTouchEvent] = null;
            var viewport = values[Keys.viewport];
            if (!viewport) {
                return;
            }
            var target:egret.DisplayObject = event.$target;
            var list = this.$getPropagationList(target);
            var length = list.length;
            var targetIndex = list.length * 0.5;
            var startIndex = -1;
            for (var i = 0; i < length; i++) {
                if (list[i] == viewport) {
                    startIndex = i;
                    break;
                }
            }
            list.splice(0, startIndex + 1);
            targetIndex -= startIndex + 1;
            this.$emitPropagationEvent(event, list, targetIndex);
            egret.Event.release(event);
        }

        public _getContentWidth():number {
            return this.$viewport.width;
        }
        public _getContentHeight(): number {
            return this.$viewport.height;
        }
        public getMaxScrollLeft(): number {
            var max = this._getContentWidth() - this.width;
            return Math.max(0, max);
        }
        public getMaxScrollTop(): number {
            var max = this._getContentHeight() - this.height;
            return Math.max(0, max);
        }

        /**
         * @private
         * 检查当前滚动策略，若有一个方向可以滚动，返回true。
         */
        private checkScrollPolicy():boolean {
            var values = this.$ScrollView;
            var hCanScroll:boolean;
            switch (values[Keys.scrollPolicyH]) {
                case "auto":
                    if (this._getContentWidth() > this.width) {
                        hCanScroll = true;
                    }
                    else {
                        hCanScroll = false;
                    }
                    break;
                case "on":
                    hCanScroll = true;
                    break;
                case "off":
                    hCanScroll = false;
                    break;
            }
            values[Keys.horizontalCanScroll] = hCanScroll;

            var vCanScroll:boolean;
            switch (values[Keys.scrollPolicyV]) {
                case "auto":
                    if (this._getContentHeight() > this.height) {
                        vCanScroll = true;
                    }
                    else {
                        vCanScroll = false;
                    }
                    break;
                case "on":
                    vCanScroll = true;
                    break;
                case "off":
                    vCanScroll = false;
                    break;
            }
            values[Keys.verticalCanScroll] = vCanScroll;
            return hCanScroll || vCanScroll;
        }

        /**
         * @private
         * @param event
         */
        private onTouchBegin(event:egret.TouchEvent):void {
            if (event.isDefaultPrevented()) {
                return;
            }
            if (!this.checkScrollPolicy()) {
                return;
            }
            var values = this.$ScrollView;
            values[Keys.touchScrollV].stop();
            values[Keys.touchScrollH].stop();
            var viewport = values[Keys.viewport];
            values[Keys.touchStartX] = event.$stageX;
            values[Keys.touchStartY] = event.$stageY;

            if (values[Keys.horizontalCanScroll]) {
                values[Keys.touchScrollH].start(event.$stageX, this.scrollHPos,
                    this._getContentWidth() - this.width);
            }
            if (values[Keys.verticalCanScroll]) {
                values[Keys.touchScrollV].start(event.$stageY, this.scrollVPos,
                    this._getContentHeight() - this.height);
            }
            var stage = this.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
            event.preventDefault();
        }

        /**
         * @private
         * 
         * @param event 
         */
        private onTouchMove(event:egret.TouchEvent):void {
            var values = this.$ScrollView;
            if (!values[Keys.touchMoved]) {
                if (Math.abs(values[Keys.touchStartX] - event.$stageX) < ScrollView.scrollThreshold &&
                    Math.abs(values[Keys.touchStartY] - event.$stageY) < ScrollView.scrollThreshold) {
                    return;
                }
                values[Keys.touchMoved] = true;
                if(values[Keys.autoHideTimer]){
                    values[Keys.autoHideTimer].reset();
                }
            }
            if (values[Keys.delayTouchEvent]) {
                values[Keys.delayTouchEvent] = null;
                values[Keys.delayTouchTimer].stop();
            }
            if (values[Keys.horizontalCanScroll]) {
                values[Keys.touchScrollH].update(event.$stageX, this.getMaxScrollLeft());
            }
            if (values[Keys.verticalCanScroll]) {
                values[Keys.touchScrollV].update(event.$stageY, this.getMaxScrollTop());
            }
        }


        /**
         * @private
         * 
         * @param event 
         */
        private onTouchEnd(event:egret.Event):void {
            var values = this.$ScrollView;
            values[Keys.touchMoved] = false;
            var stage:egret.Stage = event.$currentTarget;
            stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);

            if (values[Keys.horizontalCanScroll]) {
                values[Keys.touchScrollH].finish(this.scrollHPos, this.getMaxScrollLeft());
            }
            if (values[Keys.verticalCanScroll]) {
                values[Keys.touchScrollV].finish(this.scrollVPos, this.getMaxScrollTop());
            }
        }

        public $scrollSpeed: number = 1;
        /**
         * @language en_US
         * Scroll speed, which is the ratio between the desired speed and the default speed.
         * The value range is scrollSpeed > 0. When the value is 2, the scroll speed is two times of the default speed.
         */
        /**
         * @language zh_CN
         * 滚动速度，这个值为需要的速度与默认速度的比值。
         * 取值范围为 scrollSpeed > 0 赋值为 2 时，速度是默认速度的 2 倍
         */
        public get scrollSpeed():number {
            return this.$scrollSpeed;
        }
        public set scrollSpeed(value: number) {
            if (value == this.$scrollSpeed)
                return;
            this.$scrollSpeed = value;

            this.$ScrollView[Keys.touchScrollH].$setSpeed(value);
            this.$ScrollView[Keys.touchScrollV].$setSpeed(value);
        }

        /**
         * @language en_US
         * Obtain or set the horizontal scroll position
         */
        /**
         * @language zh_CN
         * 获取或设置水平滚动位置
         */
        public get scrollLeft():number {
            return this.scrollerRect.x;
        }
        public set scrollLeft(value: number) {
            if (value == this.scrollerRect.x)
                return;


            this.scrollerRect.x = value;
            this.setChildRect(this.scrollerRect);
        }

        private setChildRect(rect:egret.Rectangle):void {
            this.$viewport.$setScrollRect(this.scrollerRect);
        }

        /**
         * @language en_US
         * Obtain or set the vertical scroll position
         */
        /**
         * @language zh_CN
         * 获取或设置垂直滚动位置
         */
        public get scrollTop():number {
            return this.scrollerRect.y;
        }
        public set scrollTop(value: number) {
            if (value == this.scrollerRect.y)
                return;
            this.scrollerRect.y = value;
            this.setChildRect(this.scrollerRect);
        }

        /**
         * @language en_US
         * Set scroll position
         * @param top {number} Vertical scroll position
         * @param left {number} Horizontal scroll position
         * @param isOffset {boolean} Optional. The default setting is false. Whether to increase the amount of scrolling, for example, top = 1 indicates scrolling up by one pixel
         */
        /**
         * @language zh_CN
         * 设置滚动位置
         * @param top {number} 垂直滚动位置
         * @param left {number} 水平滚动位置
         * @param isOffset {boolean} 可选参数，默认是false，是否是滚动增加量，如 top=1 代表往上滚动1像素
         */
        public setScrollPosition(top: number, left: number, isOffset: boolean = false): void {
            if (isOffset && top == 0 && left == 0)
                return;
            if (!isOffset && this.scrollerRect.y == top
                && this.scrollerRect.x == left)
                return;
            if (isOffset) {
                var isEdgeV = this._isOnTheEdge(true);
                var isEdgeH = this._isOnTheEdge(false);
                this.scrollerRect.y += isEdgeV ? top / 2 : top;
                this.scrollerRect.x += isEdgeH ? left / 2 : left;
            }
            else {
                this.scrollerRect.y = top;
                this.scrollerRect.x = left;
            }

            this.setChildRect(this.scrollerRect);
        }

        private _isOnTheEdge(isVertical=true):boolean {
            var top = this.scrollerRect.y,
                left = this.scrollerRect.x;
            if (isVertical)
                return top < 0 || top > this.getMaxScrollTop();
            else
                return left < 0 || left > this.getMaxScrollLeft();
        }


        private scrollHPos:number = 0;
        private scrollVPos:number = 0;
        private scrollerRect:Rectangle = new egret.Rectangle();
        /**
         * @private
         * 
         * @param scrollPos 
         */
        private horizontalUpdateHandler(scrollPos:number):void {
            this.scrollHPos = scrollPos;

            this.scrollerRect.x = this.scrollHPos;
            this.setChildRect(this.scrollerRect);
        }

        /**
         * @private
         * 
         * @param scrollPos 
         */
        private verticalUpdateHandler(scrollPos:number):void {
            this.scrollVPos = scrollPos;

            this.scrollerRect.y = this.scrollVPos;
            this.setChildRect(this.scrollerRect);
            //this.$viewport.y = -scrollPos;
        }

        /**
         * @private
         * 
         */
        private horizontalEndHandler():void {
            if(!this.$ScrollView[Keys.touchScrollV].isPlaying()){
                this.onChangeEnd();
            }
        }

        /**
         * @private
         * 
         */
        private verticalEndHanlder():void {
            if(!this.$ScrollView[Keys.touchScrollH].isPlaying()){
                this.onChangeEnd();
            }
        }

        /**
         * @private
         * 
         */
        private onChangeEnd():void{

        }


        private _scrollerWidth:number = NONE;
        private _scrollerHeight:number = NONE;
        /**
         * @private
         */
        $getWidth():number {
            var w = this._scrollerWidth;
            return isNone(w) ? this.$getContentBounds().width : w;
        }

        /**
         * @private
         */
        $setWidth(value:number) {
            //value = +value || 0;
            if (value < 0 || value == this._scrollerWidth) {
                return;
            }
            this._scrollerWidth = value;

            this.scrollerRect.width = value;
            this.setChildRect(this.scrollerRect);

            this.$invalidateContentBounds();
        }

        /**
         * @private
         */
        $getHeight():number {
            var h = this._scrollerHeight;
            return isNone(h) ? this.$getContentBounds().height : h;
        }

        /**
         * @private
         */
        $setHeight(value:number) {
            //value = +value || 0;
            if (value < 0 || value == this._scrollerHeight) {
                return;
            }
            this._scrollerHeight = value;

            this.scrollerRect.height = value;
            this.setChildRect(this.scrollerRect);

            this.$invalidateContentBounds();
        }

        /**
         * @private
         */
        $measureContentBounds(bounds:Rectangle):void {

            bounds.setTo(0, 0, this._scrollerWidth, this._scrollerHeight);
        }

    }

    egret.registerClass(ScrollView, egret.Types.ScrollView);
}