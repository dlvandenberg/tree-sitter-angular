/**
 * @file Angular Grammar for tree-sitter
 * @author Dennis van den Berg <dennis@vdberg.dev>
 * @license MIT
 */

/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl"

const HTML = require('tree-sitter-html/grammar');

const PREC = {
  CALL: 1,
  ALIAS: 2,
};

module.exports = grammar(HTML, {
  name: 'angular',

  externals: ($, original) => original.concat([$._interpolation_start, $._interpolation_end]),

  rules: {
    // ---------- Root ---------
    _node: ($, original) => choice(prec(1, $.interpolation), original),

    // ---------- Overrides ----------
    // attribute_value: ($, original) => choice($.interpolation, $._any_expression),
    attribute_name: (_) => /[^<>.\[\]\(\)"'=\s]+/,

    // Expressions
    _any_expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.expression,
        $.ternary_expression,
        prec(3, $.conditional_expression),
      ),

    // ---------- Interpolation ---------
    interpolation: ($) =>
      seq(
        alias($._interpolation_start, '{{'),
        $._any_expression,
        alias($._interpolation_end, '}}'),
      ),

    // ---------- Property Binding ---------
    attribute: ($) =>
      choice(
        prec(1, $.property_binding),
        prec(1, $.two_way_binding),
        prec(1, $.event_binding),
        $.normal_attribute,
      ),

    property_binding: ($) => seq('[', $.binding_name, ']', $._binding_assignment),
    event_binding: ($) => seq('(', $.binding_name, ')', $._binding_assignment),
    two_way_binding: ($) => seq('[(', $.binding_name, ')]', $._binding_assignment),

    _binding_assignment: ($) =>
      seq(alias('=', $.assignment_operator), $._double_quote, $._any_expression, $._double_quote),

    binding_name: ($) => choice($.identifier, $.member_expression),

    normal_attribute: ($) =>
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
          choice($.group, $._primitive),
        ),
      ),

    // Conditional expression
    conditional_expression: ($) =>
      prec.right(
        PREC.CALL,
        seq(
          field('condition', choice($._primitive, $.unary_expression, $.binary_expression)),
          alias(choice('||', '&&'), $.conditional_operator),
          field('condition', choice($._primitive, $.unary_expression, $.conditional_expression)),
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
        seq(field('function', $.identifier), '(', optional(field('arguments', $.arguments)), ')'),
      ),
    arguments: ($) =>
      seq(
        choice($._primitive, $.binary_expression, $.unary_expression),
        repeat(seq(',', $._primitive)),
      ),

    // Member expression
    member_expression: ($) =>
      seq(field('object', $._primitive), choice('.', '?.', '!.'), field('property', $.identifier)),

    // ---------- Base ----------
    // eslint-disable-next-line quotes
    _single_quote: () => "'",
    _double_quote: () => '"',
    _binary_op: () =>
      choice('+', '-', '/', '*', '%', '==', '===', '!=', '!==', '&&', '||', '<', '<=', '>', '>='),
  },
});
