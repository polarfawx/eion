/**
 * @file Miscellaneous utility functions and classes
 * @author Andrey Glotov
 */

/* global focusTrap */

const KEY_ESC   = 27;
const KEY_SPACE = 32;

const $document = $(document);

const dropdownProto = {
    _onOutsideClick(event) {
        const target = event.target;
        if (!(
            target === document
            || this._$container.is($(target))
            || $.contains(this._$container.get(0), target)
        )) {
            this.hide();
        }
    },

    _onSwitcherClick() {
        if (!this._isExpanded) {
            this.show();
        } else {
            this.hide();
        }
    },

    _onSwitcherKeydown(event) {
        if (event.which === KEY_SPACE) {
            event.preventDefault();
            
            if (!this._isExpanded) {
                this.show();
            } else {
                this.hide();
            }
        }
    },

    _onSwitcherKeyup(event) {
        if (event.which === KEY_SPACE) {
            event.preventDefault();
        }
    },

    _onKeydown(event) {
        if (event.which === KEY_ESC) {
            this.hide();
            this._$switcher.focus();
        }
    },

    show() {
        this._isExpanded = true;

        setTimeout(() => {
            $document.on({
                click   : this._onOutsideClick,
                focusin : this._onOutsideClick,
            });
            this._$container.on('keydown', this._onKeydown);

            if (this._onToggle) {
                this._onToggle(true);
            }
        }, 0);

        return this;
    },

    hide() {
        this._isExpanded = false;

        $document.off({
            click   : this._onOutsideClick,
            focusin : this._onOutsideClick,
        });
        this._$container.off('keydown', this._onKeydown);

        if (this._onToggle) {
            this._onToggle(false);
        }

        return this;
    },

    pause() {
        this._$switcher
            .off({
                click   : this._onSwitcherClick,
                keydown : this._onSwitcherKeydown,
                keyup   : this._onSwitcherKeyup,
            });

        if (this._hoverToggles) {
            this._$container.off({
                mouseenter : this._onMouseenter,
                mouseleave : this._onMouseleave,
            });
        }

        return this;
    },

    unpause() {
        this._$switcher
            .click(this._onSwitcherClick)
            .keydown(this._onSwitcherKeydown)
            .keyup(this._onSwitcherKeyup);

        if (this._hoverToggles) {
            this._$container.hover(this._onMouseenter, this._onMouseleave);
        }

        return this;
    },
};

export const makeDropdown = function($container, $switcher, options) {
    const dropdown = Object.create(dropdownProto);

    dropdown._$container   = $container;
    dropdown._$switcher    = $switcher;
    dropdown._onToggle     = options.onToggle;
    dropdown._hoverToggles = !!options.hoverToggles;
    dropdown._isExpanded   = false;

    // Bind the event handlers
    dropdown._onOutsideClick    = dropdown._onOutsideClick.bind(dropdown);
    dropdown._onSwitcherClick   = dropdown._onSwitcherClick.bind(dropdown);
    dropdown._onSwitcherKeydown = dropdown._onSwitcherKeydown.bind(dropdown);
    dropdown._onSwitcherKeyup   = dropdown._onSwitcherKeyup.bind(dropdown);
    dropdown._onKeydown         = dropdown._onKeydown.bind(dropdown);

    if (options.hoverToggles) {
        dropdown._onMouseenter = dropdown.show.bind(dropdown);
        dropdown._onMouseleave = dropdown.hide.bind(dropdown);
    }

    dropdown.unpause();

    return dropdown;
};

const modalProto = {
    _onTrapDeactivate() {
        if (this._onToggle) {
            this._onToggle(false);
        }
    },

    show() {
        if (this._onToggle) {
            this._onToggle(true);
        }

        setTimeout(() => {
            this._trap.activate();
        }, this._focusDelay || 0);
    },

    hide() {
        this._trap.deactivate();
    },
};

export const makeModal = function($container, options) {
    const modal = Object.create(modalProto);

    modal._$container = $container;
    modal._onToggle   = options.onToggle;
    modal._focusDelay = options.focusDelay;

    modal._trap = new focusTrap($container.get(0), {
        initialFocus            : options.initialFocus,
        clickOutsideDeactivates : true,
        escapeDeactivates       : true,
        onDeactivate            : modal._onTrapDeactivate.bind(modal),
    });

    return modal;
};
