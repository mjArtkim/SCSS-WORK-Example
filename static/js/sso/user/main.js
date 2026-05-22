"use strict";

window.DolbomMainPage = {
  init() {
    this.$root = $(".site-content > .main").first();
    if (this.$root.length > 0) {
      this.backgroundKeys = ["job", "shop", "comu", "card", "trip", "insu", "edu", "map"];
      this.bindEvents();
    } else {
      return;
    }
  },

  destroy() {
    $(document).off(".dolbomMain");
    this.$content = null;
    this.$root = null;
  },

  bindEvents() {

    $(document).off(".dolbomMain");
    $(document).on(
      "click.dolbomMain",
      ".cards__list .cards__item:not(.is-coming-soon)",
      this.handleDetailCardToggle.bind(this),
    );
    $(document).on(
      "click.dolbomMain",
      ".detail-close-btn",
      this.handleDetailClose.bind(this),
    );
    $(document).on(
      "click.dolbomMain",
      ".cards__item.is-coming-soon",
      this.handleComingSoonCard.bind(this),
    );
    $(document).on("click.dolbomMain", this.handleDocumentClick.bind(this));
    $(document).on("keydown.dolbomMain", this.handleDocumentKeydown.bind(this));
  },

  handleComingSoonCard(event) {
    event.preventDefault();

    const $card = $(event.currentTarget);

    if (!this.isMobileTooltipMode()) {
      return;
    }

    const shouldOpen = !$card.hasClass("is-tooltip-open");

    this.closeComingSoonCards();
    $card.toggleClass("is-tooltip-open", shouldOpen);
  },

  handleDetailCardToggle(event) {
    event.preventDefault();

    const $card = $(event.currentTarget).closest(".cards__list");
    const detailKey = this.getDetailKey($card);

    if (!detailKey) {
      return;
    }

    const $detail = this.findDetailPanel($card, detailKey);

    if (!$detail.length) {
      return;
    }

    const isOpen = $detail.is(":visible");

    if (isOpen) {
      return;
    }

    this.closeDetailPanels($card.closest(".cards"));
    $detail.stop(true, true).slideDown(250, () => {
      this.scrollToDetailPanel($detail);
    });
    $card.addClass("is-active");
    this.setMainBackground(detailKey);
  },

  handleDetailClose(event) {
    event.preventDefault();

    const $detail = $(event.currentTarget).closest(".detail__list");
    const $cards = $detail.closest(".cards");

    $detail.stop(true, true).slideUp(200);
    this.setActiveDetailCard($cards, null);
    this.setMainBackground(null);
  },

  handleDocumentClick(event) {
    const $target = $(event.target);

    if ($target.closest(".cards__item.is-coming-soon").length) {
      return;
    }

    this.closeComingSoonCards();
  },

  handleDocumentKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }

    this.closeComingSoonCards();
  },

  closeComingSoonCards() {
    this.$root
      .find(".cards__item.is-coming-soon.is-tooltip-open")
      .removeClass("is-tooltip-open");
  },

  closeDetailPanels($scope, exceptKey = null) {
    const $cards = $scope && $scope.length ? $scope : this.$root.find(".cards");
    const $details = $cards.find(".detail__list");

    $details.each((index, element) => {
      const $detail = $(element);
      const detailKey = this.getDetailKey($detail);
      const shouldKeepOpen = exceptKey && detailKey === exceptKey;

      if (!shouldKeepOpen) {
        $detail.stop(true, true).slideUp(200);
      }
    });

    this.setActiveDetailCard($cards, exceptKey);
  },

  scrollToDetailPanel($detail) {
    if (!$detail || !$detail.length) {
      return;
    }

    const isPc = window.innerWidth >= 768;

    if (isPc) {
      const $scrollBox = $detail.closest(".cards");

      if (!$scrollBox.length) {
        return;
      }

      $scrollBox.stop(true).animate(
          {
            scrollTop: 0,
          },
          250
      );

      return;
    }

    const detailTop = $detail.offset()?.top;

    if (typeof detailTop !== "number") {
      return;
    }

    $("html, body").stop(true).animate(
        {
          scrollTop: Math.max(0, detailTop - 16),
        },
        250
    );
  },


  setActiveDetailCard($scope, activeKey) {
    $scope.find(".cards__list").each((index, element) => {
      const $card = $(element);
      const detailKey = this.getDetailKey($card);

      $card.toggleClass(
        "is-active",
        Boolean(activeKey && detailKey === activeKey),
      );
    });
  },

  findDetailPanel($card, detailKey) {
    return $card.closest(".cards").find(`.detail__list.${detailKey}`).first();
  },

  setMainBackground(activeKey) {
    if (!this.$root || !this.$root.length) {
      return;
    }

    const backgroundClasses = this.backgroundKeys.map(
      (key) => `main--bg-${key}`,
    );

    this.$root.removeClass(backgroundClasses.join(" "));

    if (this.backgroundKeys.includes(activeKey)) {
      this.$root.addClass(`main--bg-${activeKey}`);
    }
  },

  getDetailKey($element) {
    const element = $element && $element[0];

    if (!element) {
      return "";
    }

    return Array.from(element.classList).find(
      (className) =>
        ![
          "cards__list",
          "cards__item",
          "detail__list",
          "is-active",
          "is-coming-soon",
          "is-tooltip-open",
        ].includes(className),
    );
  },

  isMobileTooltipMode() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
  },
};


$(function () {
  if (window.DolbomMainPage && typeof window.DolbomMainPage.init === "function") {
    window.DolbomMainPage.init();
  } else {
    console.error("DolbomMainPage.init을 찾을 수 없습니다. 스크립트 로드 순서를 확인하세요.");
  }
});
