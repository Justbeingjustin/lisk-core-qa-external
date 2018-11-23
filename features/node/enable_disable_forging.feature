@smoke @fast
Feature: Enable Disable Forging

  In order to ensure if the node is forging block
  As a Delegate
  I want to check if enable and disable feature works

  Background: Client list
    Given I have list of clients

  Scenario: Enable forging
    Given The node is not forging
    When I enable forging
    Then The node should forge

  Scenario: Disable forging
    Given The node is forging
    When I disable forging
    Then The node should not forge
