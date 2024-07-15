/**
 * @file Angular Grammar for tree-sitter
 * @author Dennis van den Berg <dennis@vdberg.dev>
 * @license MIT
 */

/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />

const HTML = require('tree-sitter-html/grammar');

const PREC = {
  CALL: 1,
  ALIAS: 2,
};

module.exports = grammar(HTML, {
  name: 'angular',

  externals: ($, original) =>
    original.concat([
      $._interpolation_start,
      $._interpolation_end,
      $._control_flow_start,
    ]),

  rules: {
    // ---------- Root ---------
    _node: ($, original) =>
      choice(
        prec(1, $.icu_expression),
        prec(1, $.interpolation),
        prec(1, $._any_statement),
        original,
      ),

    // ---------- Overrides ----------
    attribute_name: (_) => /[^<>\*.\[\]\(\)"'=\s]+/,
    text: (_) => /[^<>{}&\s]([^<>{}&]*[^<>{}&\s])?/,

    // ---------- Statements ----------
    _any_statement: ($) =>
      choice($.if_statement, $.for_statement, $.defer_statement, $.switch_statement),

    // ---------- Switch Statement ----------
    switch_statement: ($) =>
      seq(
        $.switch_start_expression,
        repeat1($.case_statement),
        optional($.default_statement),
        $.switch_end_expression,
      ),

    case_statement: ($) => seq($.case_expression, repeat($._node), $.case_end_expression),

    default_statement: ($) =>
      seq($.default_expression, repeat($._node), $.default_end_expression),

    switch_start_expression: ($) =>
      seq(
        alias($._control_flow_start, '@'),
        alias('switch', $.control_keyword),
        '(',
        field('value', $.expression),
        ')',
        '{',
      ),

    case_expression: ($) =>
      seq(
        alias($._control_flow_start, '@'),
        alias('case', $.control_keyword),
        '(',
        field('value', $._primitive),
        ')',
        '{',
      ),

    default_expression: ($) =>
      seq(alias($._control_flow_start, '@'), alias('default', $.control_keyword), '{'),

    switch_end_expression: ($) => $._closing_bracket,
    case_end_expression: ($) => $._closing_bracket,
    default_end_expression: ($) => $._closing_bracket,

    // ---------- Defer Statement ----------
    defer_statement: ($) =>
      seq(
        $.defer_start_expression,
        repeat($._node),
        choice(
          $.placeholder_statement,
          $.loading_statement,
          $.error_statement,
          $.defer_end_expression,
        ),
      ),

    placeholder_statement: ($) =>
      seq(
        $.placeholder_expression,
        repeat($._node),
        choice($.loading_statement, $.error_statement, $.defer_end_expression),
      ),

    loading_statement: ($) =>
      seq(
        $.loading_expression,
        repeat($._node),
        choice($.error_statement, $.placeholder_statement, $.defer_end_expression),
      ),

    error_statement: ($) =>
      seq($.error_expression, repeat($._node), $.defer_end_expression),

    defer_start_expression: ($) =>
      seq(
        alias($._control_flow_start, '@'),
        alias('defer', $.control_keyword),
        optional($.defer_trigger),
        '{',
      ),

    placeholder_expression: ($) =>
      seq(
        token(prec(2, '} @')),
        alias('placeholder', $.control_keyword),
        optional($.placeholder_minimum),
        '{',
      ),

    loading_expression: ($) =>
      seq(
        token(prec(2, '} @')),
        alias('loading', $.control_keyword),
        optional($.loading_condition),
        '{',
      ),

    error_expression: ($) =>
      seq(token(prec(2, '} @')), alias('error', $.control_keyword), '{'),

    defer_end_expression: ($) => $._closing_bracket,

    defer_trigger: ($) =>
      seq(
        '(',
        $.defer_trigger_condition,
        optional(repeat(seq(';', $.defer_trigger_condition))),
        ')',
      ),

    placeholder_minimum: ($) => seq('(', field('minimum', $._timed_expression), ')'),

    loading_condition: ($) =>
      seq(
        '(',
        field('condition', $._timed_expression),
        optional(seq(';', field('condition', $._timed_expression))),
        ')',
      ),

    defer_trigger_condition: ($) =>
      seq(
        optional(alias('prefetch', $.prefetch_keyword)),
        choice(
          seq(alias('when', $.special_keyword), field('trigger', $._any_expression)),
          seq(alias('on', $.special_keyword), field('trigger', $._primitive)),
        ),
      ),

    _timed_expression: ($) =>
      seq(
        alias(choice('after', 'minimum'), $.special_keyword),
        field('value', $.number),
        alias(choice('ms', 's'), $.unit),
      ),

    // ---------- For Statement ----------
    for_statement: ($) =>
      seq(
        $.for_start_expression,
        repeat($._node),
        choice($.empty_statement, $.for_end_expression),
      ),

    empty_statement: ($) =>
      seq($.empty_expression, repeat($._node), $.for_end_expression),

    for_start_expression: ($) =>
      seq(
        alias($._control_flow_start, '@'),
        alias('for', $.control_keyword),
        '(',
        $.for_declaration,
        optional(field('reference', $.for_reference)),
        ')',
        '{',
      ),

    empty_expression: ($) =>
      seq(token(prec(2, '} @')), alias('empty', $.control_keyword), '{'),

    for_end_expression: ($) => $._closing_bracket,

    for_declaration: ($) =>
      seq(
        field('name', $.identifier),
        alias('of', $.special_keyword),
        field('value', $.expression),
        ';',
        alias('track', $.special_keyword),
        field('value', $.expression),
      ),

    for_reference: ($) =>
      seq(
        ';',
        alias('let', $.special_keyword),
        field('alias', $.assignment_expression),
        repeat(seq(choice(';', ','), $.assignment_expression)),
      ),

    // ---------- If Statement ----------
    if_statement: ($) =>
      seq(
        $.if_start_expression,
        repeat($._node),
        choice($.else_if_statement, $.else_statement, $.if_end_expression),
      ),

    else_if_statement: ($) =>
      seq(
        $.else_if_expression,
        repeat($._node),
        choice($.else_if_statement, $.else_statement, $.if_end_expression),
      ),

    else_statement: ($) => seq($.else_expression, repeat($._node), $.if_end_expression),

    if_start_expression: ($) =>
      seq(
        alias($._control_flow_start, '@'),
        alias('if', $.control_keyword),
        '(',
        $.if_condition,
        optional(field('reference', $.if_reference)),
        ')',
        '{',
      ),

    else_if_expression: ($) =>
      seq(
        token(prec(2, '} @')),
        alias('else', $.control_keyword),
        alias('if', $.control_keyword),
        '(',
        $.if_condition,
        optional(field('reference', $.if_reference)),
        ')',
        '{',
      ),

    else_expression: ($) =>
      seq(token(prec(2, '} @')), alias('else', $.control_keyword), '{'),

    if_end_expression: ($) => $._closing_bracket,

    if_condition: ($) => prec.right(PREC.CALL, $._any_expression),

    if_reference: ($) => seq(';', alias('as', $.special_keyword), $.identifier),

    // ---------- Expressions -----------
    _any_expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.expression,
        $.ternary_expression,
        $.nullish_coalescing_expression,
        prec(3, $.conditional_expression),
      ),

    assignment_expression: ($) =>
      seq(field('name', $.identifier), '=', field('value', $._any_expression)),

    // -------- ICU expressions ---------
    icu_expression: ($) =>
      seq(
        '{',
        choice($._any_expression, $.concatenation_expression),
        ',',
        $.icu_clause,
        ',',
        repeat1($.icu_case),
        '}',
      ),

    icu_clause: () => choice('plural', 'select'),

    icu_case: ($) => seq($.icu_category, '{', repeat1($._node), '}'),

    icu_category: () => /[^{}]+/i,

    // ---------- Interpolation ---------
    interpolation: ($) =>
      seq(
        alias($._interpolation_start, '{{'),
        choice($._any_expression, $.concatenation_expression),
        alias($._interpolation_end, '}}'),
      ),

    concatenation_expression: ($) =>
      prec(
        2,
        seq($._primitive, '+', $.expression, optional(repeat(seq('+', $._primitive)))),
      ),

    // ---------- Property Binding ---------
    attribute: ($) =>
      choice(
        prec(1, $.property_binding),
        prec(1, $.two_way_binding),
        prec(1, $.event_binding),
        prec(1, $.structural_directive),
        $._normal_attribute, // <-- This needs to be hidden from syntax tree
      ),

    // ---------- Structural Directives ---------
    structural_directive: ($) =>
      seq(
        '*',
        $.identifier,
        optional(
          seq(
            '=',
            $._double_quote,
            choice($.structural_expression, $.structural_declaration),
            $._double_quote,
          ),
        ),
      ),

    structural_expression: ($) =>
      seq(
        $._any_expression,
        optional($._alias),
        optional($._else_template_expression),
        optional($._context_expression),
      ),

    structural_declaration: ($) =>
      seq(
        alias('let', $.special_keyword),
        seq(
          $.structural_assignment,
          repeat(seq(choice(';', ','), $.structural_assignment)),
        ),
      ),

    structural_assignment: ($) =>
      choice(
        seq(field('name', $.identifier), ':', field('value', $.identifier)),
        prec.left(
          PREC.ALIAS,
          seq(
            optional(alias('let', $.special_keyword)),
            field('name', $.identifier),
            field('operator', choice($.identifier, '=')),
            field('value', $.expression),
            optional($._alias),
          ),
        ),
        seq(field('name', $.identifier), optional($._alias)),
      ),

    _alias: ($) => seq(alias('as', $.special_keyword), field('alias', $.identifier)),
    _else_template_expression: ($) =>
      seq(';', alias('else', $.special_keyword), $.identifier),
    _context_expression: ($) =>
      seq(
        ';',
        choice(alias('context', $.special_keyword), field('named', $.identifier)),
        ':',
        $._any_expression,
      ),

    // ---------- Bindings ----------
    property_binding: ($) => seq('[', $.binding_name, ']', $._binding_assignment),
    event_binding: ($) => seq('(', $.binding_name, ')', $._binding_assignment),
    two_way_binding: ($) => seq('[(', $.binding_name, ')]', $._binding_assignment),

    _binding_assignment: ($) =>
      seq(
        '=',
        $._double_quote,
        optional(choice($._any_expression, $.assignment_expression)),
        $._double_quote,
      ),

    binding_name: ($) => seq(optional('@'), choice($.identifier, $.member_expression)),

    _normal_attribute: ($) =>
      seq(
        $.attribute_name,
        optional(seq('=', choice($.attribute_value, $.quoted_attribute_value))),
      ),

    // ---------- Expressions ---------
    // Expression
    expression: ($) => seq($._primitive, optional(field('pipes', $.pipe_sequence))),

    // Unary expression
    unary_expression: ($) =>
      seq(field('operator', alias('!', $.unary_operator)), field('value', $.expression)),

    // Binary expression
    binary_expression: ($) =>
      seq(
        field('left', $._primitive),
        field('operator', $._binary_op),
        field('right', $._primitive),
      ),

    // Ternary expression
    ternary_expression: ($) =>
      prec.right(
        PREC.CALL,
        seq(
          field('condition', $._any_expression),
          alias('?', $.ternary_operator),
          choice($.group, $._primitive),
          alias(':', $.ternary_operator),
          choice($.group, $._any_expression),
        ),
      ),

    // Nullish coalescing expression
    nullish_coalescing_expression: ($) =>
      seq(
        field('condition', $._any_expression),
        alias('??', $.coalescing_operator),
        field('default', $._primitive),
      ),

    // Conditional expression
    conditional_expression: ($) =>
      prec.right(
        PREC.CALL,
        seq(
          field(
            'condition',
            choice($._primitive, $.unary_expression, $.binary_expression),
          ),
          alias(choice('||', '&&'), $.conditional_operator),
          field(
            'condition',
            choice(
              $._primitive,
              $.unary_expression,
              $.binary_expression,
              $.conditional_expression,
            ),
          ),
        ),
      ),

    // ---------- Pipes ---------
    pipe_sequence: ($) => repeat1(seq(alias('|', $.pipe_operator), $.pipe_call)),

    pipe_call: ($) =>
      seq(field('name', $.identifier), optional(field('arguments', $.pipe_arguments))),

    pipe_arguments: ($) => repeat1($._pipe_argument),
    _pipe_argument: ($) => seq(':', $._primitive),

    // ---------- Primitives ----------
    _primitive: ($) =>
      choice(
        $.object,
        $.array,
        $.identifier,
        $.string,
        $.number,
        $.group,
        $.call_expression,
        $.member_expression,
        $.bracket_expression,
      ),

    // Object
    object: ($) => seq('{', repeat($.pair), '}'),
    pair: ($) =>
      seq(
        field('key', choice($.identifier, $.string)),
        ':',
        field('value', choice($.expression, $.unary_expression)),
        optional(','),
      ),

    // Array
    array: ($) =>
      seq(
        '[',
        choice($.expression, $.unary_expression),
        repeat(seq(',', choice($.expression, $.unary_expression))),
        ']',
      ),

    // Identifier
    identifier: () => /[a-zA-Z_0-9\-\$]+/,

    // String
    string: ($) =>
      choice(
        seq($._double_quote, repeat(token.immediate(/[^"]/)), $._double_quote),
        seq($._single_quote, repeat(token.immediate(/[^']/)), $._single_quote),
      ),

    // Number
    number: () => /[0-9]+\.?[0-9]*/,

    // Group
    group: ($) => seq('(', $._any_expression, ')'),

    // Call expression
    call_expression: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field('function', $.identifier),
          '(',
          optional(field('arguments', $.arguments)),
          ')',
        ),
      ),
    arguments: ($) =>
      seq(
        choice($._primitive, $.binary_expression, $.unary_expression),
        repeat(seq(',', $._primitive)),
      ),

    // Member expression
    member_expression: ($) =>
      seq(
        field('object', $._primitive),
        choice(
          seq(
            choice('.', '?.', '!.'),
            choice(field('property', $.identifier), field('call', $.call_expression)),
          ),
        ),
      ),

    // Bracket expression
    bracket_expression: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field('object', $._primitive),
          '[',
          field('property', choice($.identifier, $.static_member_expression)),
          ']',
        ),
      ),

    static_member_expression: ($) => seq($._single_quote, $.identifier, $._single_quote),

    // ---------- Base ----------
    _closing_bracket: (_) => token(prec(-1, '}')),
    // eslint-disable-next-line quotes
    _single_quote: () => "'",
    _double_quote: () => '"',
    _binary_op: () =>
      choice(
        '+',
        '-',
        '/',
        '*',
        '%',
        '==',
        '===',
        '!=',
        '!==',
        '&&',
        '||',
        '<',
        '<=',
        '>',
        '>=',
      ),
  },
});
